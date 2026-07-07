// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Icon from "components/icon/icon"
import React from "react"

export default function ChartEditorDataSourcePrompt() {
  return (
    <div className={"chart-editor-error-wrap"}>
      <div className={"error-box-wrap"}>
        <div className={"error-box"}>
          <div className={"error-icon connect-to-data-source"}>
            <Icon name={"connect-to-data-source"} />
          </div>
          <div className={"error-msg"}>{"Connect to a Data Source"}</div>
        </div>
      </div>
    </div>
  )
}
