// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-sync, no-console */
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const retired = /^@rmwc\/(button|checkbox|dialog|menu|slider|switch|tooltip)(\/|$)/
function violations(file, source) {
  const errors = []
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  function visit(node) {
    const module = ts.isImportDeclaration(node)
      ? node.moduleSpecifier
      : ts.isCallExpression(node) && node.expression.getText(ast) === "require"
      ? node.arguments[0]
      : null
    if (module && ts.isStringLiteral(module)) {
      const value = module.text
      if (
        retired.test(value) ||
        /^(@hot-loader\/|react-hot-loader|enzyme($|\/))/.test(value) ||
        /^@material-ui\//.test(value) ||
        /^(recompose|react-selectize|react-dropzone-component|react-dates|react-sizeme|react-toggle|connected-react-router|redux-promise-middleware|redux-devtools-extension|rc-slider)($|\/)/.test(
          value
        )
      ) {
        errors.push(`${file}: retired UI dependency ${value}`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return errors
}
function files(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(directory, entry.name))
        : [path.join(directory, entry.name)]
    )
}
if (require.main === module) {
  const root = path.resolve(__dirname, "../..")
  const errors = files(path.join(root, "src"))
    .filter((file) => /\.[jt]sx?$/.test(file))
    .flatMap((file) =>
      violations(path.relative(root, file), fs.readFileSync(file, "utf8"))
    )
  if (errors.length) {
    console.error(errors.join("\n"))
    process.exitCode = 1
  } else {
    console.log(
      "Owned UI primitive imports and retired React test/hot-loader boundaries passed."
    )
  }
}
module.exports = { violations }
