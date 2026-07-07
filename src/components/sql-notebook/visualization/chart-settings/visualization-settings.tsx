// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState, ChangeEvent } from "react"
import { Switch } from "@rmwc/switch"
import {
  ChartFieldAssignment,
  CHART_TYPE_SCHEMA,
  ChartDef,
  ChartField,
  ChartTypeState,
  ChartTypes,
  FieldsByType,
  ChartSettings
} from "../../types"
import { createInitialState } from "../utils"
import { ChartDataField } from "./chart-data-field"
import NumericalSlider from "vega/components/NumericalSlider"

import "./visualization-settings.scss"
import { capitalizeFirstLetter } from "utils/time-helpers"
import MultiSelect from "widgets/multi-select/Multi-select"
import {
  AllowedVegaTypesPerChartField,
  CHART_SETTINGS_MAP,
  SCALE_TYPES,
  SETTING_KEY,
  DEFAULT_VEGA_SCATTER_POINT_SIZE
} from "./constants"
import { PointmapSettings } from "./pointmap/pointmap-settings"
import { PolygonMapSettings } from "./polygon-map/polygon-map-settings"
import { LineMapSettings } from "./line-map/line-map-settings"
import { uniqBy } from "lodash"

interface ISqlNotebookVisualizationSettings {
  chart: ChartDef
  availableFields: FieldsByType
  onUpdate: (settings: ChartDef) => void // TODO: Define settings type
  dataSize?: number
  setDataSize?: (n: number) => void
  maxDataSize: number
  vegaData: any[]
}
type MultiSelectField = {
  field: string
  value: any
}

export interface IChartSpecificSettings {
  assignedChartFields: ChartTypeState
  chartSettings: ChartSettings
  updateSettings: (updates: Partial<ChartSettings>) => void
}

const getChartSettings = (type: string) => {
  switch (type) {
    case ChartTypes.POINT_MAP:
      return PointmapSettings
    case ChartTypes.POLYGON_MAP:
      return PolygonMapSettings
    case ChartTypes.LINE_MAP:
      return LineMapSettings
    default:
      return null
  }
}

// TODO: These props kind of suck, make it better
export const SqlNotebookVisualizationSettings = ({
  chart,
  availableFields,
  onUpdate,
  dataSize,
  setDataSize,
  vegaData
}: ISqlNotebookVisualizationSettings) => {
  const chartSchema: ChartFieldAssignment[] = CHART_TYPE_SCHEMA[chart.type]
  const [initialDataSize] = useState(dataSize)

  const [availableSettings, setAvailableSettings] = useState(
    CHART_SETTINGS_MAP[chart.type]
  )
  const [assignedChartFields, setAssignedChartFields] = useState<
    ChartTypeState
  >(createInitialState(chart.fields, chartSchema))

  const [chartSettings, setChartSettings] = useState<ChartSettings>(
    chart.settings ?? {}
  )

  // Updates the chart whenever new fields are assigned or settings are changed
  const chartUpdated = (
    newAssignedChartFields: ChartTypeState,
    newSettings: ChartSettings
  ) => {
    if (chart.update) {
      onUpdate(chart.update(newAssignedChartFields, vegaData, newSettings))
    } else {
      // Create a new object with the assigned fields + settings
      const newChart = {
        ...chart,
        settings: {
          ...newSettings
        }
      }
      Object.values(newAssignedChartFields).forEach(
        (chartField: ChartField) => {
          if (!newChart.fields) {
            newChart.fields = []
          }
          const modifiedFieldIdx = newChart.fields.findIndex(
            (f) => f.assignedTo === chartField.assignedTo
          )
          newChart.fields.splice(modifiedFieldIdx, 1, chartField)
        }
      )
      onUpdate(newChart)
    }
  }

  const updateSelectedChartField = (
    fieldType: string,
    newField: ChartField
  ): void => {
    newField.assignedTo = fieldType
    const newAssignedChartFields = {
      ...assignedChartFields,
      [fieldType]: newField
    }
    // update xOffset field for bar charts with color measure
    if (
      chart.type === ChartTypes.BAR &&
      fieldType === ChartFieldAssignment.COLOR
    ) {
      newAssignedChartFields[ChartFieldAssignment.X_OFFSET] = newField
    }

    setAssignedChartFields(newAssignedChartFields)
    chartUpdated(newAssignedChartFields, chartSettings)
  }

  const updateSettings = (updates: any) => {
    const newSettings = {
      ...chartSettings,
      ...updates
    }
    setChartSettings(newSettings)
    chartUpdated(assignedChartFields, newSettings)
  }

  // Reset settings/fields when chart type/fields changes
  useEffect(() => {
    setAvailableSettings(CHART_SETTINGS_MAP[chart.type])
    setAssignedChartFields(createInitialState(chart.fields, chartSchema))
  }, [chart.type, chart.fields, chartSchema])

  useEffect(() => {
    setChartSettings(chart.settings || {})
  }, [chart.settings])

  const allAvailableFields = useMemo(
    () => Object.values(availableFields).flat(),
    [availableFields]
  )

  const ChartSpecificSettings: React.FC<
    IChartSpecificSettings
  > | null = useMemo(() => getChartSettings(chart.type), [chart.type])

  return (
    <div className="visualization-controls">
      <header>Chart Data</header>
      {chartSchema.map(
        (assignedFieldType: ChartFieldAssignment, index: number) => {
          const assignedField = assignedChartFields[assignedFieldType]
          if (assignedField && !assignedField?.static) {
            const validVegaTypes =
              AllowedVegaTypesPerChartField[chart.type][assignedFieldType] ?? []
            const fieldOptions = validVegaTypes
              .map((resultFieldType) =>
                allAvailableFields.filter((f) => f.type === resultFieldType)
              )
              .flat()
            return (
              <ChartDataField
                chart={chart}
                key={index}
                type={assignedFieldType}
                assignedChartFields={assignedChartFields}
                fieldOptions={uniqBy(fieldOptions, "field")}
                updateSelectedChartField={updateSelectedChartField}
              />
            )
          }
          return null
        }
      )}
      {availableSettings?.includes(SETTING_KEY.BORDER) && (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="sql-notebook-visualization-view__field-container sql-notebook-visualization-view__toggle">
            <span className="sql-notebook-visualization-view__field-label">
              Border
            </span>
            <Switch
              checked={chart.settings?.border ?? false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                updateSettings({
                  border: e.target.checked
                })
              }}
            />
          </div>
        </div>
      )}
      {availableSettings?.includes(SETTING_KEY.SIZE_SLIDER) &&
        !assignedChartFields?.size?.active && (
          <div className="visualization-data-limit">
            <NumericalSlider
              label="Size"
              value={
                chart.settings?.pointSize ?? DEFAULT_VEGA_SCATTER_POINT_SIZE
              }
              max={400}
              min={1}
              step={1}
              onChange={(val: number) => {
                updateSettings({
                  pointSize: val
                })
              }}
            />
          </div>
        )}
      {availableSettings?.includes(SETTING_KEY.SCALE_TYPE) &&
        chart.settings?.availableScales && (
          <div className="sql-notebook-visualization-view__field-wrapper">
            <div className="sql-notebook-visualization-view__field-container">
              <header>Scale Type</header>
              <div className="sql-notebook-visualization-view__chart-field">
                <MultiSelect
                  className="sql-notebook-visualization-view__chart-field"
                  value={{
                    label: capitalizeFirstLetter(
                      chartSettings?.scaleType ?? SCALE_TYPES.LINEAR
                    ),
                    value: chartSettings?.scaleType ?? SCALE_TYPES.LINEAR
                  }}
                  placeholder={undefined}
                  options={chart.settings.availableScales.map((s) => ({
                    label: capitalizeFirstLetter(s),
                    value: s
                  }))}
                  onChange={(f: MultiSelectField) => {
                    updateSettings({
                      scaleType: f.value
                    })
                  }}
                  noLabel
                />
              </div>
            </div>
          </div>
        )}
      {availableSettings?.includes(SETTING_KEY.CLAMP) && (
        <div className="sql-notebook-visualization-view__field-wrapper">
          <div className="sql-notebook-visualization-view__field-container sql-notebook-visualization-view__toggle">
            <span className="sql-notebook-visualization-view__field-label">
              Start Axis at 0
            </span>
            <Switch
              checked={chart.settings?.clamp ?? false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                updateSettings({
                  clamp: e.target.checked
                })
              }}
            />
          </div>
        </div>
      )}
      {availableSettings?.includes(SETTING_KEY.DATA_LIMIT) && (
        <div className="visualization-data-limit">
          <NumericalSlider
            label="Data Limit"
            value={dataSize}
            max={initialDataSize}
            min={1}
            step={1}
            onChange={setDataSize}
          />
        </div>
      )}
      {ChartSpecificSettings && (
        <ChartSpecificSettings
          chartSettings={chartSettings}
          assignedChartFields={assignedChartFields}
          updateSettings={updateSettings}
        />
      )}
    </div>
  )
}
