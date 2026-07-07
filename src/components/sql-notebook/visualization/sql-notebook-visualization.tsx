// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from "react"
import { SqlNotebookVisualizationView } from "./sql-notebook-visualization-view"
import { ChartDef, FieldsByType } from "../types"
import { VegaMap } from "./vega-map/vega-map/vega-map"

import { SqlNotebookVisualizationSettings } from "./chart-settings/visualization-settings"
import { useVegaMapSettings } from "./vega-map/vega-map/use-vega-map-settings"
import "./sql-notebook-visualization.scss"
import { GEO_CHART_TYPES } from "./vega-map/constants"

// Takes a chart def and chooses the right visualization view to show
export const SqlNotebookVisualization = ({
  chart,
  availableFields,
  data,
  cellIndex,
  setLoading
}: {
  chart: ChartDef
  availableFields: FieldsByType
  data: any[] // Array of query results
  cellIndex: number
  setLoading: (loading: boolean) => void
}) => {
  // TODO: We are keeping a lot of local state, we may be able to consolidate a lot of this
  // and receive updates from props
  const [chartState, setChartState] = useState(chart)
  const [dataSize, setDataSize] = useState(data.length)
  const [vegaData, setVegaData] = useState(data)
  const vegaObserver = useRef<undefined | MutationObserver>()

  const vegaMapSettings = useVegaMapSettings(chartState)

  useEffect(() => {
    setVegaData([...data.slice(0, dataSize)])
  }, [dataSize, data])

  // Updates chart state when settings change
  const updateSettings = useCallback((settings) => {
    setChartState(settings)
  }, [])

  // Updates chart state if selected chart changes
  useEffect(() => {
    setChartState(chart)
  }, [chart])

  // Update data state when data changes
  useEffect(() => {
    setVegaData(data)
    setDataSize(data.length)
  }, [data])

  useEffect(() => {
    if (!GEO_CHART_TYPES.includes(chart.type)) {
      const waitForVega = async () => {
        await new Promise<void>((resolve) => {
          if (document.querySelector(".vega-embed")) {
            resolve()
          }

          if (!vegaObserver.current) {
            vegaObserver.current = new MutationObserver(() => {
              if (document.querySelector(".vega-embed")) {
                vegaObserver.current?.disconnect()
                resolve()
              }
            })
          }

          vegaObserver.current.observe(document.body, {
            childList: true,
            subtree: true
          })
        })

        setLoading(false)
      }

      waitForVega()
    }

    return () => {
      vegaObserver.current?.disconnect()
    }
  }, [chart.type, setLoading])

  return (
    <div className="sql-notebook-visualization">
      <SqlNotebookVisualizationSettings
        availableFields={availableFields}
        chart={chartState}
        onUpdate={updateSettings}
        maxDataSize={data.length}
        dataSize={dataSize}
        setDataSize={setDataSize}
        vegaData={vegaData}
      />
      {GEO_CHART_TYPES.includes(chart.type) ? (
        <VegaMap
          chartSettings={vegaMapSettings}
          mapId={cellIndex}
          setLoading={setLoading}
        />
      ) : (
        <SqlNotebookVisualizationView
          vegaSpec={chartState.spec}
          vegaData={vegaData}
        />
      )}
    </div>
  )
}
