// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

function createChartRegistry() {
  const plugins = new Map()
  return {
    register(plugin) {
      if (!plugin || typeof plugin.type !== "string" || !plugin.type) {
        throw new Error("A persisted chart type is required")
      }
      plugins.set(plugin.type, plugin)
      return plugin
    },
    get: (type) => plugins.get(type),
    list: () => Array.from(plugins.values())
  }
}
module.exports = { createChartRegistry }
