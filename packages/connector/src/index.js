// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Adapt a supplied legacy client without introducing a global client/session.
function createDbTransport(client) {
  return {
    query: (sql, options) => client.queryAsync(sql, options),
    queryArrow: (sql, options) => client.queryDFAsync(sql, options),
    render: (widgetId, spec, options) =>
      client.renderVegaAsync(widgetId, spec, options),
    getTables: () => client.getTablesAsync(),
    cancellation: "discard-results-only"
  }
}
module.exports = { createDbTransport }
