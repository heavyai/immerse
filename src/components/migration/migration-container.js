// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import dc from "services/dc"
import { Switch } from "widgets/switch/Switch"
import { SecondaryButton } from "widgets/button/Button"
import { createChart } from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"
import { setChartFilters } from "actions/charts-filter-action-creators"
import { addChart } from "actions/dashboard-layout-action-creators"
import { initialChart } from "reducers/charts/helpers/initialChart"

import "./migration-container.css"

const MigrationContainer = (props) => {
  const [selected, setSelected] = useState({})
  const [comparator, setComparator] = useState(undefined)
  const [sharedScrolling, setSharedScrolling] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [dumpStore, setDumpStore] = useState(false)
  const [dumpInitial, setDumpInitial] = useState(false)
  const [localCharts, setLocalCharts] = useState({})
  const [invalidCharts, setInvalidCharts] = useState({})

  useEffect(() => {
    document
      .querySelectorAll(".migration-container textarea")
      .forEach((textarea) => {
        textarea.scrollTop = scrollTop
      })
  })

  if (props.hidden) {
    return null
  }

  const charts = Object.keys(props.charts).reduce((bucket, chartId) => {
    const chart = props.charts[chartId]
    if (
      !chart.dcFlag ||
      !dc.getChart(chart.dcFlag) ||
      !dc.getChart(chart.dcFlag).isCountChart()
    ) {
      bucket[chartId] = {
        obj: chart,
        type: "chart",
        id: chartId,
        title: chart.title || chartId
      }
      const snaps = props.snapshots[chartId] || []
      snaps.forEach((snap, i) => {
        const snapshotKey = `${chartId},${i}`
        bucket[snapshotKey] = {
          obj: snap.snapshot,
          type: "snapshot",
          id: snapshotKey,
          title: `Chart ${chartId}, snapshot ${i}`
        }
      })
    }

    return bucket
  }, {})

  const selectedClasses = [undefined, "selected"]

  return (
    <div className="migration-container">
      <div className="chart-dumps">
        <div>
          <ul className="charts">
            <li>Select the charts you wish to view</li>
            {Object.entries(charts).map(([chartId, chart]) => {
              return (
                <li
                  key={chartId}
                  className={selectedClasses[selected[chartId] || 0]}
                  onClick={() => {
                    let val = (selected[chartId] || 0) + 1
                    if (val === 2) {
                      val = 0
                    }
                    setSelected({ ...selected, [chartId]: val })
                    if (chartId === comparator) {
                      setComparator(undefined)
                    }
                  }}
                >
                  {chart.title}
                </li>
              )
            })}
            <li
              className={dumpStore ? "selected" : undefined}
              onClick={() => setDumpStore(!dumpStore)}
            >
              Show entire store
            </li>
            <li
              className={dumpInitial ? "selected" : undefined}
              onClick={() => setDumpInitial(!dumpInitial)}
            >
              Show initial chart
            </li>
          </ul>
          <Switch
            id="shared-scrolling-checkbox"
            checked={sharedScrolling}
            onChange={() => setSharedScrolling(!sharedScrolling)}
          />
          <label htmlFor="shared-scrolling-checkbox">
            Enable shared scrolling
          </label>
        </div>
        {Object.keys(charts)
          .filter((chartId) => selected[chartId])
          .map((chartId) => {
            /* const chartWalk = deepPathWalk(chart)
            // toss out the first key - it's the root one.
            if (chartWalk[0].key.length === 0) {
              chartWalk.pop()
            }*/
            const chart = charts[chartId]
            const chartJSON =
              localCharts[chartId] || JSON.stringify(chart.obj, undefined, 2)
            return (
              <div className="chart-json-container" key={chartId}>
                <div>{chart.title}</div>
                <div>
                  <textarea
                    className={
                      invalidCharts[chartId] ? "invalid-chart" : undefined
                    }
                    rows={30}
                    cols={50}
                    onChange={(e) => {
                      const newChartJSON = e.target.value
                      try {
                        JSON.parse(newChartJSON)
                        setInvalidCharts({
                          ...invalidCharts,
                          [chartId]: false
                        })
                        // eslint-disable-next-line no-console
                        console.log("SAVES LOCAL : ", chartId, newChartJSON)
                      } catch (err) {
                        setInvalidCharts({
                          ...invalidCharts,
                          [chartId]: true
                        })
                      }
                      setLocalCharts({
                        ...localCharts,
                        [chartId]: newChartJSON
                      })
                    }}
                    onScroll={(e) => {
                      if (sharedScrolling) {
                        setScrollTop(e.target.scrollTop)
                      }
                    }}
                    value={chartJSON}
                    readOnly={chart.type === "snapshot"}
                  />
                  <div>
                    {chart.type === "chart" && (
                      <SecondaryButton
                        onClick={async () => {
                          if (localCharts[chartId]) {
                            const newChart = JSON.parse(localCharts[chartId])
                            await props.updateChart(chartId, newChart)
                            props.setChartFilters(chartId, newChart.filters)
                            const newLocalCharts = { ...localCharts }
                            delete newLocalCharts[chartId]
                            setLocalCharts(newLocalCharts)
                          }
                        }}
                        disabled={invalidCharts[chartId]}
                      >
                        Update chart
                      </SecondaryButton>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

        {dumpStore && (
          <div className="chart-json-container">
            <textarea
              rows={30}
              cols={50}
              readOnly
              value={JSON.stringify(props.store, undefined, 2)}
            />
          </div>
        )}

        {dumpInitial && (
          <div className="chart-json-container">
            <textarea
              rows={30}
              cols={50}
              readOnly
              value={JSON.stringify(initialChart(), undefined, 2)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    charts: state.charts,
    snapshots: state.snapshots.chart,
    store: state
  }
}

export default connect(mapStateToProps, {
  updateChart,
  createChart,
  setChartFilters,
  addChart
})(MigrationContainer)
