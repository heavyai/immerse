// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FormEvent } from "react"
import { useSelector, useDispatch } from "react-redux"

import { AppState } from "vega/charts/types"
import { BoxPlotCenterLineType } from "vega/constants/data-selection-types"
import { Switch } from "widgets/switch/Switch"
import CustomSelector from "components/custom-selector/custom-selector"
import NumericalSlider from "vega/components/NumericalSlider"
import {
  setNumberOfGroups,
  setNullDimensionsEnabled,
  setBoxPlotCenterLineType,
  setViolinDistributionPrecision
} from "vega/actions/data-selection-action-creators"
import BaseDimensionSort from "vega/components/BaseDimensionSort"

// Somewhat arbitrary defaults, "usually look good" settings
export const DEFAULT_VIOLIN_PRECISION = 80
export const MAX_DISTRIBUTION_PRECISION = 200
export const MIN_DISTRIBUTION_PRECISION = 10
export const MAX_NUM_GROUPS = 200

export const DataSettings = ({ chartId }: { chartId: string }) => {
  const dispatch = useDispatch()

  const {
    showNumberOfGroupsSlider,
    numberOfGroups,
    violinDistributionPrecision,
    showingNullDimensions,
    showNullDimensionsToggle,
    centerLineType
  } = useSelector((state: AppState) => {
    const chart = state.charts[chartId]

    return {
      showNumberOfGroupsSlider: !chart.binSettings,
      // If a chart was converted from combo or other chart that can
      // have > max num groups, set it to the max
      numberOfGroups:
        chart.numberOfGroups > MAX_NUM_GROUPS
          ? MAX_NUM_GROUPS
          : chart.numberOfGroups,
      // Likewise if the distribution precision is not set (created from
      // a chart that did not default this value), then default it
      violinDistributionPrecision:
        chart.violinDistributionPrecision ?? DEFAULT_VIOLIN_PRECISION,
      showingNullDimensions: chart.showNullDimensions,
      showNullDimensionsToggle: !(
        chart.binSettings?.dimensionType === "binned_numeric" ||
        chart.binSettings?.dimensionType === "binned_time"
      ),
      centerLineType: chart.centerLineType
    }
  })

  const actions = {
    setNumberOfGroups: (numGroups: number) =>
      dispatch(setNumberOfGroups(chartId, numGroups)),
    setViolinDistributionPrecision: (numGroups: number) =>
      dispatch(setViolinDistributionPrecision(chartId, numGroups)),
    setNullDimensionsEnabled: (enabled: boolean) =>
      dispatch(setNullDimensionsEnabled(chartId, enabled)),
    setBoxPlotLineType: (lineType: string) =>
      dispatch(setBoxPlotCenterLineType(chartId, lineType))
  }

  const centerLineOptions = [
    {
      label: "Median",
      value: BoxPlotCenterLineType.MEDIAN
    },
    {
      label: "Mean",
      value: BoxPlotCenterLineType.MEAN
    }
  ]

  return (
    <>
      <div className="select-with-sort">
        <BaseDimensionSort chartId={chartId} />
      </div>
      {showNumberOfGroupsSlider && (
        <NumericalSlider
          label="# of Groups"
          max={MAX_NUM_GROUPS}
          min={1}
          step={1}
          value={numberOfGroups}
          onChange={actions.setNumberOfGroups}
        />
      )}
      <NumericalSlider
        label="Violin Distribution Precision"
        max={MAX_DISTRIBUTION_PRECISION}
        min={MIN_DISTRIBUTION_PRECISION}
        step={1}
        value={violinDistributionPrecision}
        onChange={actions.setViolinDistributionPrecision}
      />
      <div className="switch-with-label">
        <div>Center Line</div>
        <CustomSelector
          currentValue={centerLineType}
          id="box-plot-center-line-type-selector"
          onChange={actions.setBoxPlotLineType}
          options={centerLineOptions}
        />
      </div>
      {showNullDimensionsToggle && (
        <div className="switch-with-label">
          <div>Include null values</div>
          <Switch
            checked={showingNullDimensions}
            onChange={(event: FormEvent<HTMLInputElement>) =>
              actions.setNullDimensionsEnabled(event.currentTarget.checked)
            }
          />
        </div>
      )}
    </>
  )
}
