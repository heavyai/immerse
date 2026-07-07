// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Switch } from "@rmwc/switch"
import { clamp } from "lodash"
import ColorPickerParent from "components/color-picker/color-picker-parent"
import ChartSettingsBasemapDropdownParent from "components/chart-settings-basemap-dropdown/chart-settings-basemap-dropdown-parent"
import { useCurrentEditingChart } from "charts/utils/hooks"
import { useBorderColorPalette } from "charts/utils/hooks/useBorderColorPalette"
import {
  setContourGriddingCellSettings,
  setContourIntervals,
  setContourMajorIntervalSettings,
  setContourMinorIntervalSettings,
  updateRasterChart
} from "charts/raster-chart/raster-chart-actions"
import SettingsPanel from "components/settings-panel"
import ContourIntervalPanel from "vega/components/ContourIntervalPanel"
import IconMajorIsoline from "components/svg-icons/icon-major-isoline"
import IconMinorIsoline from "components/svg-icons/icon-minor-isoline"
import { calculateValidMinorSubdivisions, getValueMeasure } from "./utils"
import {
  majorIntervalDescription,
  minorIntervalDescription,
  fillDescription
} from "./constants"
import CustomSlider from "components/custom-slider/custom-slider"
import IconTooltip from "components/icon-with-tooltip"
import CustomSelector from "components/custom-selector/custom-selector"
import { getRasterStride } from "actions/selector-action-creators"
import { useMetersPerPixel } from "charts/utils/hooks/useMetersPerPixel"
import "./contour-display-settings.scss"
import { decimalDegreesToMeters } from "utils/geo"
import MultiSelect from "../../../widgets/multi-select/Multi-select"
import { setAggType } from "../../../reducers/charts/helpers/measure-object-helpers"
import { updateSelector } from "../../../actions/charts-action-creators"

const majorIntervalTooltipText =
  "The distance between one major isoline and the next."
const minorIntervalTooltipText =
  "The number of minor isolines between each major isoline."
const aggTypeOptions = [
  {
    label: "Avg",
    value: "Avg"
  },
  {
    label: "Min",
    value: "Min"
  },
  {
    label: "Max",
    value: "Max"
  }
]

export function ContourDisplaySettings() {
  // This will be calculated from data domain once it exists
  const { chartId, chart } = useCurrentEditingChart()
  const dashboardId = useSelector((state) => {
    return state.dashboard?.id
  })
  const [minGridCellSize, setMinGridCellSize] = useState()
  const [maxGridCellSize, setMaxGridCellSize] = useState()
  const [strideLength, setStrideLength] = useState()
  const dispatch = useDispatch()
  const { borderColorPalette } = useBorderColorPalette()

  const {
    rasterLayerId,
    majorContourSettings,
    minorContourSettings,
    griddingCell,
    type: chartType,
    measures,
    dimensions,
    fillOpacity,
    neighborhoodFillRadius,
    dataSource
  } = chart

  const metersPerPixel = useMetersPerPixel(chartId)
  const valueMeasure = getValueMeasure(measures)
  const hasValueMeasure = Boolean(valueMeasure?.value)
  const [minContourValue, maxContourValue] = valueMeasure?.minMax ?? [0, 1]

  // Absolute value accounts for largely negative measure value
  // Don't let this get out of hand, clamp to MIN_SAFE_INTEGER/MAX_SAFE_INTEGER
  const maxContourInterval = clamp(
    Math.abs(Math.round(maxContourValue - minContourValue)),
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER
  )
  const minContourInterval = clamp(
    Math.abs(Math.ceil((maxContourValue - minContourValue) / 100)),
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER
  )

  const initialValidSubdivisions = calculateValidMinorSubdivisions(
    majorContourSettings?.intervalSize
  )
  const [validSubdivisions, setValidSubdivisions] = useState(
    initialValidSubdivisions
  )
  // Set valid subdivisions for the dropdown when major contour interval changes
  const onMajorContourIntervalChange = useCallback(
    (majorContourInterval) => {
      const recalculatedSubdivisions = calculateValidMinorSubdivisions(
        majorContourInterval
      )
      setValidSubdivisions(recalculatedSubdivisions)

      // If the existing subdivision selection is invalid, reset it to first valid
      let subdivisions = minorContourSettings?.intervalSubdivisions
      const isValid = recalculatedSubdivisions
        .map(({ value }) => value)
        .includes(subdivisions)
      if (!isValid) {
        subdivisions = recalculatedSubdivisions[0]?.value ?? 0
      }

      dispatch(setContourIntervals(chartId, majorContourInterval, subdivisions))
    },
    [chartId, dispatch, minorContourSettings?.intervalSubdivisions]
  )

  // Handles setting a valid minor subdivisions when major interval is set elsewhere (when measure is set)
  useEffect(() => {
    if (majorContourSettings?.intervalSize) {
      onMajorContourIntervalChange(majorContourSettings?.intervalSize)
    } else {
      setValidSubdivisions([])
    }
  }, [majorContourSettings?.intervalSize, onMajorContourIntervalChange])

  // Handles min and max grid cell size based on the stride length and meters per pixel calculations
  useEffect(() => {
    // We shouldn't allow smaller grid cell size than max of raster stride or pixel meters
    setMinGridCellSize(Math.round(Math.max(strideLength, metersPerPixel)))
    setMaxGridCellSize(Math.round(Math.max(strideLength, metersPerPixel) * 10))
  }, [strideLength, metersPerPixel])

  // Handles requesting the raster stride if we don't have it
  // Stores retrieved value in local state
  useEffect(() => {
    const latColumn = dimensions.find((d) => d.name === "Lat")
    const lonColumn = dimensions.find((d) => d.name === "Lon")
    // Null stride length if we don't have lat/lng dimensions
    if (!latColumn?.value || !lonColumn?.value) {
      setStrideLength(null)
    } else {
      getRasterStride({
        table: dataSource,
        latColumn,
        lonColumn,
        chartId,
        dashboardId
      }).then((results) => {
        const ddStrideLength = results?.avg_x_delta ?? 0
        const meterStrideLength = decimalDegreesToMeters(ddStrideLength)
        setStrideLength(meterStrideLength)
      })
    }
  }, [chartId, dashboardId, dataSource, dimensions])

  // Handles setting the gridding cell size in state
  // If it's not set this sets it
  // If it's set but outside the range it clamps it to the range
  useEffect(() => {
    const gridCellSize = griddingCell?.size
    if (!gridCellSize) {
      const defaultBinSize = Math.round(
        Math.max(metersPerPixel, strideLength) * 2
      )
      dispatch(setContourGriddingCellSettings(chartId, "size", defaultBinSize))
    } else if (
      gridCellSize > maxGridCellSize ||
      gridCellSize < minGridCellSize
    ) {
      dispatch(
        setContourGriddingCellSettings(
          chartId,
          "size",
          clamp(gridCellSize, minGridCellSize, maxGridCellSize)
        )
      )
    }
  }, [
    strideLength,
    metersPerPixel,
    griddingCell?.size,
    dispatch,
    chartId,
    maxGridCellSize,
    minGridCellSize
  ])

  const onMajorContourSettingsChange = (value, field) => {
    dispatch(
      setContourMajorIntervalSettings(chartId, {
        [field]: value
      })
    )
  }

  const onMinorContourSettingsChange = (value, field) => {
    dispatch(
      setContourMinorIntervalSettings(chartId, {
        [field]: value
      })
    )
  }

  const onGriddingCellSettingsChange = (value, field) => {
    dispatch(setContourGriddingCellSettings(chartId, field, value))
  }

  const updateFillEnabled = (value) => {
    dispatch(
      updateRasterChart(chartId, {
        fillEnabled: value
      })
    )
  }
  const updateFillOpacity = (value) => {
    dispatch(
      updateRasterChart(chartId, {
        fillOpacity: value
      })
    )
  }
  const updateSmoothing = (value) => {
    dispatch(
      updateRasterChart(chartId, {
        neighborhoodFillRadius: value
      })
    )
  }
  const updateAggType = (aggType) => {
    dispatch(updateSelector(chartId, "measures", 0, setAggType(aggType)))
    dispatch({
      type: "UPDATE_RASTER_CHART_MEASURE_AGG",
      index: 0,
      chartId
    })
  }

  return (
    <div key={rasterLayerId} className="contour-display-settings">
      <div className="chart-editor-section map-themes">
        <div className="chart-editor-label">Map Theme</div>
        <ChartSettingsBasemapDropdownParent
          chartId={chartId}
          chartType={chartType}
        />
      </div>
      <SettingsPanel panelTitle="Sampling">
        <div>
          <div className="chart-editor-label">Gridding Cell Size Meters</div>
          <div className="interval-settings-container">
            <CustomSlider
              testid="contour-fill-opacity"
              defaultValue={griddingCell?.size}
              max={maxGridCellSize}
              min={minGridCellSize}
              onValueChange={(val) => {
                onGriddingCellSettingsChange(val, "size")
              }}
              step={1}
              disabled={!griddingCell?.size}
              disabledTooltipText="Dimensions must be set before setting gridding cell size"
            />
          </div>
          <div className="chart-editor-label">Smoothing</div>
          <div className="interval-settings-container">
            <CustomSlider
              defaultValue={neighborhoodFillRadius}
              testid="contour-smoothing"
              max={20}
              min={0}
              onValueChange={updateSmoothing}
              step={1}
            />
          </div>
          <div className="chart-editor-label">Aggregation Method</div>
          <MultiSelect
            blurInputOnSelect
            isDisabled={!hasValueMeasure}
            noLabel
            value={
              hasValueMeasure
                ? aggTypeOptions.find(
                    ({ value }) => value === valueMeasure.aggType
                  )
                : aggTypeOptions[0]
            }
            options={aggTypeOptions}
            onChange={({ value: aggType }) => {
              updateAggType(aggType)
            }}
          />
        </div>
      </SettingsPanel>

      <SettingsPanel
        panelTitle={
          <div className="switch-with-label">
            <h3 className="settings-panel-title">Fill</h3>
            <Switch
              checked={chart.fillEnabled ?? false}
              onChange={(event) => updateFillEnabled(event.target.checked)}
            />
          </div>
        }
        panelDesc={fillDescription}
      >
        {chart.fillEnabled && (
          <div>
            <div className="fill-color-selector">
              <div className="chart-editor-label">Color Palette</div>
              <ColorPickerParent id={chartId} savedColors={chart.savedColors} />
            </div>
            <div className="chart-editor-label">Fill Opacity</div>
            <div className="interval-settings-container">
              <CustomSlider
                defaultValue={Math.round((fillOpacity ?? 1) * 100)}
                testid="contour-fill-opacity"
                max={100}
                min={0}
                onValueChange={(val) => {
                  const floatVal = parseFloat((val / 100).toFixed(2))
                  updateFillOpacity(floatVal)
                }}
                step={1}
              />
            </div>
          </div>
        )}
      </SettingsPanel>

      <SettingsPanel
        panelIcon={<IconMajorIsoline className="panel-icon" />}
        panelTitle="major"
        panelDesc={majorIntervalDescription}
      >
        <ContourIntervalPanel
          labels={majorContourSettings?.labels ?? false}
          width={majorContourSettings?.borderWidth}
          color={majorContourSettings?.borderColor}
          colorPalette={borderColorPalette}
          opacity={majorContourSettings?.borderOpacity}
          onSettingsChange={onMajorContourSettingsChange}
        >
          <div className="chart-editor-label interval-divisions">
            <span>Interval Size</span>
            <IconTooltip
              tooltipText={majorIntervalTooltipText}
              enterDelay={500}
              icon="info_outlined"
            />
          </div>
          <div className="interval-settings-container">
            <CustomSlider
              defaultValue={clamp(
                majorContourSettings?.intervalSize,
                minContourInterval,
                maxContourInterval
              )}
              testid="major-contour-interval-slider"
              max={maxContourInterval}
              min={minContourInterval}
              onValueChange={(val) =>
                onMajorContourIntervalChange(
                  clamp(val, minContourInterval, maxContourInterval),
                  "intervalSize"
                )
              }
              step={1}
              disabled={!hasValueMeasure}
              disabledTooltipText={
                "You must select a measure before setting interval size"
              }
            />
          </div>
        </ContourIntervalPanel>
      </SettingsPanel>
      <SettingsPanel
        panelIcon={<IconMinorIsoline className="panel-icon" />}
        panelTitle="minor"
        panelDesc={minorIntervalDescription}
      >
        <ContourIntervalPanel
          validSubdivisions={validSubdivisions}
          width={minorContourSettings?.borderWidth}
          color={minorContourSettings?.borderColor}
          colorPalette={borderColorPalette}
          opacity={minorContourSettings?.borderOpacity}
          onSettingsChange={onMinorContourSettingsChange}
        >
          <div className="chart-editor-label interval-divisions">
            <span>Interval Subdivisions</span>
            <IconTooltip
              tooltipText={minorIntervalTooltipText}
              enterDelay={500}
              icon="info_outlined"
            />
          </div>
          <div className="interval-settings-container">
            <CustomSelector
              currentValue={minorContourSettings?.intervalSubdivisions}
              onChange={(val) =>
                onMinorContourSettingsChange(val, "intervalSubdivisions")
              }
              options={validSubdivisions}
              disabled={!hasValueMeasure}
              disabledTooltipText={
                "You must select a measure before setting minor contour subdivisions"
              }
              id="minor-contour-interval"
            />
          </div>
        </ContourIntervalPanel>
      </SettingsPanel>
    </div>
  )
}

export default ContourDisplaySettings
