// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Runtime instance ownership stays with composition; never import app services.
function createLegacyDcEngine(dc) {
  return {
    redraw: (groups) => dc.redrawAllAsync(groups),
    render: (groups) => dc.renderAllAsync(groups)
  }
}
module.exports = { createLegacyDcEngine }
