// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const root = path.resolve(__dirname, "../..")
const baselinePath = path.join(
  root,
  "docs/modernization/architecture-baseline.json"
)

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return []
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const filename = path.join(directory, entry.name)
      return entry.isDirectory() ? filesUnder(filename) : [filename]
    })
    .sort()
}

function scan(directory = path.join(root, "src")) {
  const sites = {}
  for (const filename of filesUnder(directory)) {
    if (
      !/\.[jt]sx?$/.test(filename) ||
      /\.(test|spec)\.[jt]sx?$/.test(filename) ||
      filename.endsWith(".d.ts")
    )
      continue
    const source = ts.createSourceFile(
      filename,
      fs.readFileSync(filename, "utf8"),
      ts.ScriptTarget.Latest,
      true
    )
    const relative = path.relative(root, filename).split(path.sep).join("/")
    function record(category, node, detail) {
      const signature = `${category}|${relative}|${
        detail || node.getText(source).replace(/\s+/g, " ")
      }`
      sites[signature] = (sites[signature] || 0) + 1
    }
    function moduleName(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        return node.moduleSpecifier.text
      if (
        ts.isCallExpression(node) &&
        node.arguments.length &&
        ts.isStringLiteral(node.arguments[0]) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.getText(source) === "require")
      )
        return node.arguments[0].text
      return null
    }
    function chartTypeUsed(node) {
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name.text === "type" &&
        /chart/i.test(node.expression.getText(source))
      )
        return true
      if (
        ts.isElementAccessExpression(node) &&
        node.argumentExpression &&
        node.argumentExpression.getText(source).replace(/["']/g, "") ===
          "type" &&
        /chart/i.test(node.expression.getText(source))
      )
        return true
      return ts.forEachChild(node, chartTypeUsed) || false
    }
    function visit(node) {
      const name = moduleName(node)
      if (name) {
        for (const [category, matches] of [
          ["heavyai", /^@heavyai\//.test(name)],
          ["rmwc", /^@rmwc\//.test(name)],
          ["mui", /^@material-ui\//.test(name)],
          ["store", /(?:^|\/)importableStore$/.test(name)],
          ["saga", /^redux-saga(?:\/|$)/.test(name)],
          ["reselect", name === "reselect"]
        ])
          if (matches) record(category, node, name)
      }
      if (
        (ts.isIfStatement(node) ||
          ts.isSwitchStatement(node) ||
          ts.isConditionalExpression(node)) &&
        chartTypeUsed(node.expression || node.condition)
      )
        record("chart-type-branch", node.expression || node.condition)
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return Object.fromEntries(
    Object.entries(sites).sort(([a], [b]) => a.localeCompare(b))
  )
}

function regressions(current, baseline) {
  return Object.entries(current)
    .filter(([key, count]) => count > (baseline[key] || 0))
    .map(([key, count]) => ({ site: key, added: count - (baseline[key] || 0) }))
}

if (require.main === module) {
  const sites = scan()
  if (process.argv.includes("--update")) {
    fs.writeFileSync(
      baselinePath,
      `${JSON.stringify({ schemaVersion: 1, sites }, null, 2)}\n`
    )
    console.log(
      `Recorded ${
        Object.keys(sites).length
      } architecture sites. Review all baseline additions.`
    )
  } else {
    const added = regressions(
      sites,
      JSON.parse(fs.readFileSync(baselinePath, "utf8")).sites
    )
    if (added.length) {
      console.error(JSON.stringify(added, null, 2))
      process.exitCode = 1
    } else
      console.log(
        `Architecture ratchet passed (${Object.values(sites).reduce(
          (a, b) => a + b,
          0
        )} occurrences).`
      )
  }
}
module.exports = { filesUnder, scan, regressions }
