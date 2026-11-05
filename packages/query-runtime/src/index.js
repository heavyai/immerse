// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// A port around the existing queued connector. Coalescing/cache semantics stay
// with the injected implementation until the Wave 2 query-runtime migration.
function createLegacyQueryRuntime(createQueuedConnector) {
  return { forChart: (options) => createQueuedConnector(options) }
}
module.exports = { createLegacyQueryRuntime }
Object.assign(module.exports, require("./results"))

Object.assign(module.exports, require("./vega-results"))
