// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs")
const path = require("node:path")
const { filesUnder } = require("./architecture.cjs")
const root = path.resolve(__dirname, "../..")
const relative = (filename) =>
  path.relative(root, filename).split(path.sep).join("/")
const sourceFiles = filesUnder(path.join(root, "src"))
const config = require(path.join(root, "jest.config.js"))
const { spawnSync } = require("node:child_process")
const testFiles = sourceFiles.filter((filename) =>
  /\.(test|spec)\.[jt]sx?$/.test(filename)
)
const projects = config.projects.map((project) => {
  const result = spawnSync(
    process.execPath,
    [
      require.resolve("jest/bin/jest"),
      "--listTests",
      "--json",
      "--runInBand",
      "--selectProjects",
      project.displayName
    ],
    { cwd: root, encoding: "utf8", env: { ...process.env, NODE_ENV: "test" } }
  )
  if (result.status !== 0)
    throw new Error(result.stderr || "Jest inventory failed")
  const listStart = result.stdout.indexOf("[")
  const selected = JSON.parse(result.stdout.slice(listStart))
    .map(relative)
    .sort()
  return { name: project.displayName, patterns: project.testMatch, selected }
})
const selected = new Set(projects.flatMap((project) => project.selected))
const excluded = testFiles
  .map(relative)
  .filter((filename) => !selected.has(filename))
const pkg = require(path.join(root, "package.json"))
const gitDependencies = Object.entries(pkg.dependencies)
  .filter(([, version]) => /github:|git\+|git@/.test(version))
  .map(([name, version]) => ({
    name,
    version,
    consumers: sourceFiles
      .filter(
        (filename) =>
          /\.[jt]sx?$/.test(filename) &&
          !/\.(test|spec)\./.test(filename) &&
          fs.readFileSync(filename, "utf8").includes(name)
      )
      .map(relative)
  }))
const toolingFiles = [
  "package.json",
  ".npmrc",
  "webpack.config.common.ts",
  "jest.config.js",
  ...filesUnder(path.join(root, "scripts")).map(relative),
  ...filesUnder(path.join(root, ".github/workflows")).map(relative),
  ...filesUnder(path.join(root, "test-config/puppeteer"))
    .map(relative)
    .filter((name) => !name.endsWith("package-lock.json"))
]
const tooling = toolingFiles.flatMap((filename) =>
  fs
    .readFileSync(path.join(root, filename), "utf8")
    .split("\n")
    .flatMap((line, index) =>
      /\bnpm\b|\bnpx\b|node_modules|legacy-peer-deps|overrides|symlinks/.test(
        line
      )
        ? [{ file: filename, line: index + 1, text: line.trim() }]
        : []
    )
)
const report = {
  schemaVersion: 1,
  projects,
  excludedLegacyUnit: excluded.filter((name) => /\.unit\.spec\./.test(name)),
  excludedOther: excluded.filter((name) => !/\.unit\.spec\./.test(name)),
  gitDependencies,
  npmMigration: {
    engines: pkg.engines,
    overrides: pkg.overrides,
    hooks: pkg.husky,
    lockfiles: [
      "package-lock.json",
      "test-config/puppeteer/package-lock.json"
    ].filter((name) => fs.existsSync(path.join(root, name))),
    tooling
  }
}
const output = process.argv[2]
if (output)
  fs.writeFileSync(path.resolve(output), `${JSON.stringify(report, null, 2)}\n`)
else console.log(JSON.stringify(report, null, 2))
