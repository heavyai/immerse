// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { TextField } from "widgets/text-field/TextField"

import { useChartUpdateFromEvent } from "charts/utils/hooks"

import "./chart.scss"

const ChartTemplateSettings = (props) => {
  const onUpdateSettingsValue = useChartUpdateFromEvent(
    props.id,
    "settingsValue"
  )

  return (
    <>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Measure overrides</div>
        <div className="measure-overrides">
          <div>Target:</div>
          <div>
            <TextField
              autoComplete="off"
              value={props.chart.settingsValue ?? ""}
              onChange={onUpdateSettingsValue}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ChartTemplateSettings
