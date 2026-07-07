// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useCallback, useMemo } from "react"

import ColorPickerParent from "components/color-picker/color-picker-parent"
import { TextField } from "widgets/text-field/TextField"
// import ChartFormatting from "components/chart-settings/chart-formatting"
import ToggleSwitchComponent from "components/toggle-switch-component/ToggleSwitchComponent"

import {
  useChartUpdateFromEvent,
  useChartToggle,
  useSetCrossFilter
} from "charts/utils/hooks"
import { useOnValueChangeWithShowAbsoluteValues } from "charts/utils/shared-chart-settings-handlers"

import "./chart-settings.css"

const formatPercentage = (val, decimals = 2) =>
  `${(val * 100).toFixed(decimals)}%`

const Segment = ({ val, disabled, updateSegment = () => {} }) => {
  const [localVal, setLocalVal] = useState()
  const [formattedVal, setFormattedVal] = useState()
  useEffect(() => {
    setLocalVal(val)
    setFormattedVal(formatPercentage(val))
  }, [val])

  const handleUpdate = () => {
    const parsedVal = parseFloat(localVal, 10)
    if (isNaN(parsedVal)) {
      setLocalVal(val)
      setFormattedVal(formatPercentage(val))
    } else if (val !== localVal) {
      updateSegment(parsedVal / 100)
    }
  }

  return (
    <div>
      <TextField
        disabled={disabled}
        autoComplete="off"
        value={formattedVal ?? ""}
        onChange={(e) => {
          setLocalVal(e.target.value)
          setFormattedVal(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.target.blur()
          }
        }}
        onBlur={handleUpdate}
      />
    </div>
  )
}

const GaugeChartSettings = (props) => {
  const onUpdateUnfilteredValues = useChartToggle(props.id, "unfilteredValues")
  const onUpdateTargetOverride = useChartUpdateFromEvent(
    props.id,
    "targetOverride"
  )

  const setWedgeFilter = useSetCrossFilter({
    chartId: props.id,
    columns: props.chart.measures.filter((d) => d.name === "base"),
    name: "wedge"
  })

  const updateMinOverride = useChartUpdateFromEvent(props.id, "minOverride")
  const updateMaxOverride = useChartUpdateFromEvent(props.id, "maxOverride")

  const onUpdateMinOverride = useCallback(
    (e) => {
      setWedgeFilter(undefined)
      updateMinOverride(e)
    },
    [setWedgeFilter, updateMinOverride]
  )

  const onUpdateMaxOverride = useCallback(
    (e) => {
      setWedgeFilter(undefined)
      updateMaxOverride(e)
    },
    [setWedgeFilter, updateMaxOverride]
  )

  const onValueChangeWithShowAbsoluteValues = useOnValueChangeWithShowAbsoluteValues(
    props.id,
    props.updateChart,
    props.chart.showAbsoluteValues
  )

  const segments = useMemo(() => {
    const numSegments = props.chart.color.val.length
    const chartSegments = props.chart.segments || []
    const segmentsVal = []
    for (let i = 0; i < numSegments; i++) {
      if (i < chartSegments.length && chartSegments.length === numSegments) {
        segmentsVal.push(chartSegments[i])
      } else {
        segmentsVal.push({ size: 1 / numSegments })
      }
    }
    return segmentsVal
  }, [props.chart.segments, props.chart.color.val])

  const localSegmentsLength = segments.length
  const chartSegmentsLength = props.chart.segments?.length
  const { id: chartId, updateChart } = props

  useEffect(() => {
    if (localSegmentsLength !== chartSegmentsLength) {
      setWedgeFilter(undefined)
      updateChart(chartId, { segments })
    }
  }, [
    localSegmentsLength,
    chartSegmentsLength,
    chartId,
    updateChart,
    segments,
    setWedgeFilter
  ])

  const getSegmentUpdater = (i) => {
    return (val) => {
      const newSegments = [...segments]
      newSegments[i] = { ...segments[i], size: Math.max(val, 0) }

      let runningSize = 0
      for (let j = 0; j < newSegments.length; j++) {
        // check each size and confirm it's not > 1. if it is, dial it down.
        runningSize += newSegments[j].size
        if (runningSize > 1) {
          newSegments[j] = {
            ...newSegments[j],
            size: newSegments[j].size - (runningSize - 1)
          }
          runningSize = 1
        }
      }

      if (runningSize < 1) {
        newSegments[newSegments.length - 1].size += 1 - runningSize
      }
      setWedgeFilter(undefined)
      props.updateChart(props.id, { segments: newSegments })
    }
  }

  return (
    <div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Color Palette</div>
        <ColorPickerParent
          id={props.id}
          savedColors={props.chart.savedColors}
        />
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Segments</div>
        <div className="segments">
          {segments.map((segment, i) => {
            return (
              <React.Fragment key={i}>
                <div>Segment {i + 1}</div>

                <div>
                  <Segment
                    val={segment.size}
                    disabled={i === segments.length - 1}
                    updateSegment={getSegmentUpdater(i)}
                  />
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
      <div className="chart-editor-section">
        <div className="chart-editor-label">Measure overrides</div>
        <div className="measure-overrides">
          <div>Target:</div>
          <div>
            <TextField
              autoComplete="off"
              pattern="^-?\d+(\.\d+)?"
              value={props.chart.targetOverride ?? ""}
              onChange={onUpdateTargetOverride}
            />
          </div>
          <div>Min:</div>
          <div>
            <TextField
              autoComplete="off"
              pattern="^-?\d+(\.\d+)?"
              value={props.chart.minOverride ?? ""}
              onChange={onUpdateMinOverride}
            />
          </div>
          <div>Max:</div>
          <div>
            <TextField
              autoComplete="off"
              pattern="^-?\d+(\.\d+)?"
              value={props.chart.maxOverride ?? ""}
              onChange={onUpdateMaxOverride}
            />
          </div>
        </div>
      </div>
      <div className="chart-editor-section">
        <ToggleSwitchComponent
          configurationEnabled={props.chart.showAbsoluteValues}
          onToggleConfigurationEnabled={onValueChangeWithShowAbsoluteValues}
          label="Display Absolute Values"
          data-testid="display-absolute-values"
        />
      </div>
      <div className="chart-editor-section">
        <ToggleSwitchComponent
          configurationEnabled={props.chart.unfilteredValues}
          onToggleConfigurationEnabled={onUpdateUnfilteredValues}
          label="Use unfiltered min/max/target value"
          data-testid="filter-min-maxtarget-value"
        />
      </div>
      {/* <ChartFormatting
        measures={props.measures}
        onMeasureFormat={props.onMeasureValueChangeWithFormat}
        onDimensionFormat={props.onDimensionValueChangeWithFormat}
      /> */}
    </div>
  )
}

export default GaugeChartSettings
