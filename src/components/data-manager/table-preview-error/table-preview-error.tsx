// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import Icon from "components/icon/icon"

import "./styles.scss"

export const TablePreviewError = () => (
  <div className="table-preview-error">
    <div className="data-preview">
      <div className="preview-icon">
        <Icon name="chart-table" />
      </div>
      <span>Cannot Preview</span>
    </div>
  </div>
)

export default TablePreviewError
