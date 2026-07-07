// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"

import { TextField } from "widgets/text-field/TextField"

import { useChartUpdateFromEvent } from "charts/utils/hooks"

import { IMMERSE_CHART_ID } from "./constants"

const IFrameChartSettings = (props) => {
  const [urlWithChartId, setUrlWithChartId] = useState()

  useEffect(() => {
    try {
      const urlObj = new URL(props.chart.settingsUrl)
      if (urlObj.searchParams.get(IMMERSE_CHART_ID) === null) {
        urlObj.searchParams.set(IMMERSE_CHART_ID, props.id)
      }
      setUrlWithChartId(urlObj.toString())
    } catch (e) {
      // just toss it out for now
    }
  }, [props.id, props.chart.settingsUrl])

  const onChangeUrl = useChartUpdateFromEvent(props.id, "url")
  const onChangeSettingsUrl = useChartUpdateFromEvent(props.id, "settingsUrl")

  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">iFrame Url</div>
        <TextField
          autoComplete="off"
          value={props.chart.url}
          onChange={onChangeUrl}
          onBlur={onChangeUrl}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">iFrame Settings Url</div>
        <TextField
          autoComplete="off"
          value={props.chart.settingsUrl}
          onChange={onChangeSettingsUrl}
          onBlur={onChangeSettingsUrl}
        />
      </div>
      {props.chart.settingsUrl && (
        <iframe src={urlWithChartId} height="100%" width="100%" />
      )}
    </div>
  )
}

export default IFrameChartSettings
