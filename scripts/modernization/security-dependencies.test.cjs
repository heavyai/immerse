// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const assert = require("node:assert/strict")
const { promises: fs } = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const { createRequire } = require("node:module")
const { Worker } = require("node:worker_threads")
const test = require("node:test")

function consumerRequire(...chain) {
  let load = require
  for (const name of chain) {
    load = createRequire(load.resolve(name))
  }
  return load
}

test("the actual texture compressor reads file dimensions through image-size 2", async () => {
  const load = consumerRequire(
    "deck.gl",
    "@deck.gl/geo-layers",
    "@loaders.gl/3d-tiles",
    "@loaders.gl/gltf",
    "@loaders.gl/textures",
    "texture-compressor"
  )
  const { getImageSize } = load("./utilities.js")
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "immerse-image-size-")
  )
  try {
    const file = path.join(directory, "test.png")
    const png = Buffer.alloc(24)
    Buffer.from("89504e470d0a1a0a0000000d49484452", "hex").copy(png)
    png.writeUInt32BE(42, 16)
    png.writeUInt32BE(21, 20)
    await fs.writeFile(file, png)
    assert.deepEqual(getImageSize(file), { height: 21, width: 42, type: "png" })
    await fs.writeFile(file, "invalid image")
    assert.throws(() => getImageSize(file))
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})

test("the legacy combo D3 dependency rejects adversarial colors without blocking", async () => {
  const load = consumerRequire("@heavyai/d3-combo-chart/package.json", "d3")
  const colorPath = load.resolve("d3-color")
  const worker = new Worker(
    `
    const { parentPort, workerData } = require('node:worker_threads');
    const { color, rgb } = require(workerData);
    const invalid = color('rgb(' + ' '.repeat(100000) + ')');
    parentPort.postMessage({ invalid, valid: rgb('steelblue').formatHex() });
  `,
    { eval: true, workerData: colorPath }
  )
  try {
    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("D3 color parsing exceeded 5 seconds")),
        5000
      )
      worker.once("message", (value) => {
        clearTimeout(timeout)
        resolve(value)
      })
      worker.once("error", (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
    assert.deepEqual(result, { invalid: null, valid: "#4682b4" })
  } finally {
    await worker.terminate()
  }
})
