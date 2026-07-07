// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { IconHeavyIQ } from "components/svg-icons/icon-heavy-iq"
import { DotLoader } from "../components/dot-loader"
import "./sql-notebook-loading-result.scss"

export const SqlNotebookLoadingResult = () => {
  return (
    <div className="sql-notebook-loading-result">
      <div className="loading-result__section">
        <IconHeavyIQ className="loading-result__icon" />
        <span className="loading-result__text">Working on it...</span>
      </div>
      <div className="loading-result__section">
        <DotLoader />
      </div>
    </div>
  )
}
