// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("node:fs")
const path = require("node:path")
const yaml = require("yaml")
const root = path.resolve(__dirname, "../..")
function identities(value) {
  const result = [],
    pattern = /git\+https:\/\/github\.com\/([^#\s]+)#([a-f0-9]{40})|https:\/\/codeload\.github\.com\/([^/\s]+\/[^/\s]+)\/tar\.gz\/([a-f0-9]{40})/g
  for (const match of value.matchAll(pattern))
    result.push(
      `${(match[1] || match[3]).replace(/\.git$/, "")}@${match[2] || match[4]}`
    )
  return result
}
function errorsFor(workspace, lock, pins) {
  const errors = [],
    approved = new Set(Object.values(pins).flatMap(identities))
  for (const [name, value] of Object.entries({
    ...workspace.catalog,
    ...workspace.overrides
  }))
    if (/git\+|github:/.test(value) && pins[name] !== value)
      errors.push(`Unapproved Git pin: ${name}`)
  for (const [name, value] of Object.entries(pins))
    if (workspace.overrides[name] !== value)
      errors.push(`Missing exact Git override: ${name}`)
  function inspect(value) {
    if (typeof value === "string" && /github\.com|git\+|github:/.test(value)) {
      const ids = identities(value)
      if (!ids.length || ids.some((id) => !approved.has(id)))
        errors.push(`Unapproved or abbreviated Git source: ${value}`)
    } else if (Array.isArray(value)) value.forEach(inspect)
    else if (value && typeof value === "object")
      for (const [key, item] of Object.entries(value)) {
        if (key !== "deprecated") {
          inspect(key)
          inspect(item)
        }
      }
  }
  inspect(lock)
  return errors
}
if (require.main === module) {
  const workspace = yaml.parse(
    fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8")
  )
  const lock = yaml.parse(
    fs.readFileSync(path.join(root, "pnpm-lock.yaml"), "utf8")
  )
  const pins = JSON.parse(
    fs.readFileSync(path.join(__dirname, "legacy-git-pins.json"), "utf8")
  )
  const errors = errorsFor(workspace, lock, pins)
  if (errors.length) {
    console.error([...new Set(errors)].join("\n"))
    process.exitCode = 1
  } else
    console.log(
      `Git sources match ${
        Object.keys(pins).length
      } approved exact legacy revisions.`
    )
}
module.exports = { errorsFor }
