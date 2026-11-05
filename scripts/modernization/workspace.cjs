// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs")
const path = require("node:path")
const { builtinModules } = require("node:module")
const ts = require("typescript")
const yaml = require("yaml")
const { filesUnder } = require("./architecture.cjs")
const root = path.resolve(__dirname, "../..")
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"))

function dependencyErrors(manifest, catalog, names) {
  const errors = []
  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies"
  ]) {
    for (const [name, value] of Object.entries(manifest[section] || {})) {
      if (names.has(name) && !value.startsWith("workspace:"))
        errors.push(`${manifest.name}: ${name} must use workspace:`)
      else if (
        !names.has(name) &&
        catalog[name] !== undefined &&
        value !== "catalog:"
      )
        errors.push(`${manifest.name}: ${name} must use catalog:`)
      else if (value === "catalog:" && catalog[name] === undefined)
        errors.push(`${manifest.name}: missing catalog entry ${name}`)
    }
  }
  return errors
}
function cycleErrors(graph) {
  const visiting = new Set(),
    visited = new Set(),
    errors = []
  function visit(name, trail) {
    if (visiting.has(name)) {
      errors.push(`Package cycle: ${trail.concat(name).join(" -> ")}`)
      return
    }
    if (visited.has(name)) return
    visiting.add(name)
    for (const next of graph[name] || []) visit(next, trail.concat(name))
    visiting.delete(name)
    visited.add(name)
  }
  Object.keys(graph).forEach((name) => visit(name, []))
  return errors
}
function check() {
  const errors = []
  const workspace = yaml.parse(
    fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8")
  )
  const rootManifest = read(path.join(root, "package.json"))
  const manifests = [
    { dir: root, manifest: rootManifest },
    {
      dir: path.join(root, "test-config/puppeteer"),
      manifest: read(path.join(root, "test-config/puppeteer/package.json"))
    }
  ]
  const packagesDir = path.join(root, "packages")
  if (fs.existsSync(packagesDir))
    for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        fs.existsSync(path.join(packagesDir, entry.name, "package.json"))
      )
        manifests.push({
          dir: path.join(packagesDir, entry.name),
          manifest: read(path.join(packagesDir, entry.name, "package.json"))
        })
    }
  const byName = new Map(manifests.map((entry) => [entry.manifest.name, entry]))
  const shared = new Map()
  for (const { manifest } of manifests)
    for (const name of new Set(
      Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })
    ))
      if (!byName.has(name)) shared.set(name, (shared.get(name) || 0) + 1)
  for (const [name, count] of shared)
    if (count > 1 && workspace.catalog[name] === undefined)
      errors.push(`Shared dependency missing from catalog: ${name}`)
  const graph = {}
  for (const { dir, manifest } of manifests) {
    errors.push(...dependencyErrors(manifest, workspace.catalog, byName))
    graph[manifest.name] = Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.peerDependencies
    }).filter((name) => byName.has(name))
    if (
      dir.startsWith(packagesDir) &&
      (!manifest.private || !manifest.exports || !manifest.types)
    )
      errors.push(
        `${manifest.name}: private package, exports and types are required`
      )
    const declared = new Set(
      Object.keys({
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.peerDependencies
      })
    )
    if (!dir.startsWith(packagesDir)) continue
    if (declared.has(rootManifest.name))
      errors.push(`${manifest.name}: packages cannot depend on the application`)
    for (const filename of filesUnder(path.join(dir, "src")).filter((name) =>
      /\.[jt]sx?$/.test(name)
    )) {
      const source = ts.createSourceFile(
        filename,
        fs.readFileSync(filename, "utf8"),
        ts.ScriptTarget.Latest,
        true
      )
      function visit(node) {
        const spec =
          ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
            ? node.moduleSpecifier
            : ts.isCallExpression(node) &&
              (node.expression.getText(source) === "require" ||
                node.expression.kind === ts.SyntaxKind.ImportKeyword)
            ? node.arguments[0]
            : null
        if (spec && ts.isStringLiteral(spec)) {
          const target = spec.text
          if (target.startsWith(".")) {
            const resolved = path.resolve(path.dirname(filename), target)
            if (!resolved.startsWith(dir + path.sep))
              errors.push(
                `${filename}: relative import crosses package boundary: ${target}`
              )
          } else {
            const name = target.startsWith("@")
              ? target.split("/").slice(0, 2).join("/")
              : target.split("/")[0]
            if (
              !declared.has(name) &&
              !builtinModules.includes(target) &&
              !target.startsWith("node:")
            )
              errors.push(
                `${filename}: undeclared dependency or app alias ${target}`
              )
            if (byName.has(name) && name !== rootManifest.name) {
              const exported = byName.get(name).manifest.exports || {}
              const subpath =
                target === name ? "." : "./" + target.slice(name.length + 1)
              if (!Object.hasOwnProperty.call(exported, subpath))
                errors.push(`${filename}: undeclared package export ${target}`)
            }
          }
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
  }
  errors.push(...cycleErrors(graph))
  for (const filename of filesUnder(path.join(root, "src")).filter(
    (name) => /\.[jt]sx?$/.test(name) && !/\.(test|spec)\./.test(name)
  )) {
    const text = fs.readFileSync(filename, "utf8")
    if (/["']@heavyai\/[^"']+\/(?:src|dist)\//.test(text))
      errors.push(
        `${filename}: HeavyAI internals belong behind a workspace adapter`
      )
  }
  for (const file of [
    "package-lock.json",
    "test-config/puppeteer/package-lock.json",
    "yarn.lock"
  ])
    if (fs.existsSync(path.join(root, file)))
      errors.push(`Competing lockfile: ${file}`)
  const pins = read(path.join(__dirname, "legacy-git-pins.json"))
  for (const [name, value] of Object.entries({
    ...workspace.catalog,
    ...workspace.overrides
  })) {
    if (/git\+|github:/.test(value) && pins[name] !== value)
      errors.push(`Unapproved Git source/revision: ${name}`)
  }
  for (const [name, value] of Object.entries(pins))
    if (workspace.overrides[name] !== value)
      errors.push(`Legacy Git constraint changed: ${name}`)
  if (rootManifest.overrides)
    errors.push("Overrides belong in pnpm-workspace.yaml")
  return { errors, graph }
}
if (require.main === module) {
  const result = check()
  if (result.errors.length) {
    console.error(result.errors.join("\n"))
    process.exitCode = 1
  } else
    console.log(
      `Workspace, catalog, public exports, dependency declarations and cycles passed (${
        Object.keys(result.graph).length
      } projects).`
    )
}
module.exports = { check, dependencyErrors, cycleErrors }
