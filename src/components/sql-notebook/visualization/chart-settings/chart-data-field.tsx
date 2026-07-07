// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect, ChangeEvent } from "react"
import { Switch } from "@rmwc/switch"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { capitalizeFirstLetter } from "utils/time-helpers"
import { ChartDef, ChartField, ChartTypeState } from "../../types"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"

import "./chart-data-field.scss"

interface IChartDataField {
  chart: ChartDef
  type: string
  assignedChartFields: ChartTypeState
  fieldOptions: ChartField[]
  updateSelectedChartField: (fieldType: string, newField: ChartField) => void
}

type MultiSelectField = {
  field: string
  value: any
}

export const ChartDataField: FC<IChartDataField> = ({
  chart,
  type,
  assignedChartFields,
  fieldOptions,
  updateSelectedChartField
}) => {
  // grab field currently assigned to this dim/measure
  const [activeField, setActiveField] = useState({
    ...assignedChartFields[type],
    binning: assignedChartFields[type]?.binning ?? false
  })

  // ensure we get updated value
  useEffect(() => {
    setActiveField({
      ...assignedChartFields[type],
      binning: assignedChartFields[type]?.binning ?? false
    })
  }, [assignedChartFields, type])

  const updateField = (f: MultiSelectField): void => {
    const newActiveField = {
      ...f.value,
      active: activeField.active,
      required: activeField.required,
      assignedTo: type
    }
    setActiveField(newActiveField)
    updateSelectedChartField(type, newActiveField)
  }

  const updateFieldDisplay = (e: ChangeEvent<HTMLInputElement>): void => {
    const newActiveField = { ...activeField, active: e.target.checked }
    setActiveField(newActiveField)
    updateSelectedChartField(type, newActiveField)
  }

  const updateBinning = (e: ChangeEvent<HTMLInputElement>): void => {
    const newActiveField = { ...activeField, binning: e.target.checked }
    setActiveField(newActiveField)
    updateSelectedChartField(type, newActiveField)
  }

  const updateNumBins = (size: number): void => {
    const newActiveField = { ...activeField, numBins: size }
    setActiveField(newActiveField)
    updateSelectedChartField(type, newActiveField)
  }

  return (
    <div className="sql-notebook-visualization-view__field-wrapper">
      {!activeField.required && (
        <div className="sql-notebook-visualization-view__field-display">
          <span className="sql-notebook-visualization-view__field-label">
            {`${capitalizeFirstLetter(activeField.assignedTo)} Measure`}
          </span>
          <Switch
            checked={activeField.active}
            onChange={updateFieldDisplay}
            aria-label={activeField.assignedTo}
          />
        </div>
      )}
      {activeField.active && (
        <div
          className="sql-notebook-visualization-view__field-container"
          aria-label={activeField?.assignedTo}
          role="combobox"
        >
          <div className="sql-notebook-visualization-view__field-type">
            {activeField?.assignedTo?.toUpperCase()}
          </div>
          <MultiSelect
            className="sql-notebook-visualization-view__chart-field"
            value={{ label: activeField.field, value: activeField }}
            placeholder={undefined}
            options={fieldOptions?.map((f) => {
              return {
                label: f.field,
                value: f
              }
            })}
            onChange={updateField}
            noLabel
          />
          {chart?.settings?.binnableFields?.includes(type) && (
            <div className="sql-notebook-visualization-view__bin-control">
              <div className="sql-notebook-visualization-view__bin-toggle">
                <span className="sql-notebook-visualization-view__field-label">
                  Binning
                </span>
                <Switch
                  checked={activeField.binning}
                  onChange={updateBinning}
                />
              </div>
              {activeField.binning && (
                <NumericalSlider
                  label="# of Bins"
                  value={activeField.numBins ?? 50}
                  max={200}
                  min={1}
                  step={1}
                  onChange={updateNumBins}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
