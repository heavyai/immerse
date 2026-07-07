// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const SupportedFilesTooltipCategory = ({ category, extensions, icon }) => (
  <div className="table-importer-hint-pair">
    <div className="table-importer-hint-pair-icon">{icon}</div>
    <div className="table-importer-hint-pair-right">
      <span className="table-importer-hint-pair-right-title">{category}:</span>
      <span className="table-importer-hint-pair-right-subtitle">
        {extensions.join(", ")}
      </span>
    </div>
  </div>
)

export default SupportedFilesTooltipCategory
