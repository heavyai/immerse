// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from "react"

import LoadingWidget from "components/app-overlay/loading-widget"
import { ChartDef, ResultData } from "../types"
import { aggregateFieldsByType, generateCharts, recommendChart } from "./utils"
import { getChartIcon } from "../utils"
import { IconToggle } from "../components/icon-toggle"
import { SqlNotebookVisualization } from "./sql-notebook-visualization"

import "./sql-notebook-visualization-manager.scss"

export const SqlNotebookVisualizationManager = ({
  data,
  cellIndex
}: {
  data: ResultData
  cellIndex: number
}) => {
  // Null indicates that charts haven't been generated yet, empty array indicates
  // that there are no suitable visualizations
  const [charts, setCharts] = useState<ChartDef[] | null>(null)
  const [resultData, setResultData] = useState<ResultData>(data)
  const [selectedChart, setSelectedChart] = useState<ChartDef | null>(null)
  const [loading, setLoading] = useState(!selectedChart)

  useEffect(() => {
    if (data) {
      const { charts: generatedCharts, data: chartData } = generateCharts(data)
      setCharts(generatedCharts)
      setResultData(chartData)

      if (!generatedCharts.length) {
        // Loading is normally toggled false on chart render, but if none to render:
        setLoading(false)
      }
    }
  }, [data])

  useEffect(() => {
    if (resultData && charts) {
      const selectedChartIsValid = charts
        .map((chart) => chart.type)
        .includes(selectedChart?.type)
      if ((charts?.length && !selectedChart) || !selectedChartIsValid) {
        const recommended = recommendChart(charts, resultData)
        setSelectedChart(recommended)
      }
      if (selectedChart && selectedChartIsValid) {
        setSelectedChart(
          charts.find((chart) => chart.type === selectedChart.type) ?? charts[0]
        )
      }
    }
  }, [charts, resultData, selectedChart])

  const availableFields = useMemo(
    () => (resultData ? aggregateFieldsByType(resultData.fields) : {}),
    [resultData]
  )

  if (charts?.length === 0) {
    return <div>No available visualizations</div>
  }

  return (
    <div className="sql-notebook-visualization-manager">
      <header className="visualizations-header">
        <div className="visualizations-header__title">
          <strong>Visualization options</strong>
          <p>Chart type selected based on data presented</p>
        </div>
        <div className="visualizations-header__charts">
          {charts?.map((c: ChartDef) => {
            const ChartIcon = getChartIcon(c)
            return (
              <IconToggle
                IconComponent={ChartIcon}
                selected={c === selectedChart}
                onClick={() => setSelectedChart(c)}
                key={c.type}
                label={c.type}
                tooltip={c.type}
              />
            )
          })}
        </div>
      </header>
      <section className="visualizations-display">
        {loading && <LoadingWidget />}
        {selectedChart ? (
          <SqlNotebookVisualization
            chart={selectedChart}
            availableFields={availableFields}
            data={resultData.results}
            cellIndex={cellIndex}
            setLoading={setLoading}
          />
        ) : (
          !loading && "No Chart Selected"
        )}
      </section>
    </div>
  )
}
