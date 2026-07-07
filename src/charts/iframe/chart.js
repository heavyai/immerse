// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"

import { useChartData } from "charts/utils/hooks"

import { IMMERSE_CHART_ID } from "./constants"
import "./chart.css"

const IFrameChart = ({ id, chart }) => {
  const [urlWithChartId, setUrlWithChartId] = useState()

  const { url } = chart

  const data = useChartData(id)

  useEffect(() => {
    try {
      const urlObj = new URL(url)
      if (urlObj.searchParams.get(IMMERSE_CHART_ID) === null) {
        urlObj.searchParams.set(IMMERSE_CHART_ID, id)
      }
      setUrlWithChartId(urlObj.toString())
    } catch (e) {
      setUrlWithChartId(undefined)
    }
  }, [id, url])

  if (!urlWithChartId) {
    return (
      <div className="undefined-iframe-chart" id={`chart${id}`}>
        {JSON.stringify(data, undefined, 2)}
      </div>
    )
  } else {
    return (
      <iframe
        src={urlWithChartId}
        height="100%"
        width="100%"
        id={`chart${id}`}
      />
    )
  }
}

export default IFrameChart
