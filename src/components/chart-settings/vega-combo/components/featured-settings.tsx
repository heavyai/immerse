// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, FormEvent } from "react"
import { connect, ConnectedProps } from "react-redux"
import { Dispatch } from "redux"
import { Switch } from "widgets/switch/Switch"

import {
  setRangeChartEnabled,
  setLegendEnabled,
  setGridEnabled,
  setBarValuesEnabled
} from "vega/actions/data-selection-action-creators"
import {
  setGroupingMode,
  setOrientation,
  setScaleType
} from "vega/actions/presentation-settings-action-creators"
import { AppState } from "vega/charts/types"

import ChartOrientationInput from "components/chart-settings/vega-combo/components/inputs/chart-orientation-input"
import BarStackingInput from "components/chart-settings/vega-combo/components/inputs/bar-stacking-input"
import LineStackingInput from "components/chart-settings/vega-combo/components/inputs/line-stacking-input"
import {
  BaseDimensionAxisSettings,
  VegaComboPresentationSettings
} from "vega/constants/presentation-settings-types"
import { ComboDataSelection } from "vega/constants/data-selection-types"
import { isGridEnabled, isLegendEnabled } from "vega/utils/presentation"
import { ScaleTypeSelector } from "components/scale-type-selector/scale-type-selector"
import { SCALE_TYPES, ScaleType } from "constants/scale-types"
import { GROUPING_MODES } from "vega/constants/grouping-types"

interface OwnProps {
  chartId: string
}

const StackingInput = ({
  dataSelections,
  selected,
  setSelected
}: {
  dataSelections: ComboDataSelection[]
  selected: BaseDimensionAxisSettings["groupingMode"]
  setSelected: (value: BaseDimensionAxisSettings["groupingMode"]) => void
}) => {
  let barMarkCount = 0
  let lineMarkCount = 0

  // The conditions here are:
  //
  // If there are at least two or more size measure bar marks, show the bar
  // stacking options.
  //
  // If there are no bar marks and at least one line mark, show the line
  // stacking options.
  //
  // If there is only one bar mark, show no stacking options.
  //
  // If there is a color dimension, it counts as "two" marks for the respective
  // mark type because it will likely result in at least two bars/lines getting
  // drawn.
  //
  // Once we've decided which options we're showing, we need to hide the
  // "percentage" option if there is only one mark total.

  for (const dataSelection of dataSelections) {
    if (dataSelection.dimensions.color) {
      // Color dimension can only have a single size measure
      const markType = dataSelection.measures.size[0]?.markSettings.markType
      if (markType === "bar") {
        barMarkCount += 2
      } else if (markType === "line") {
        lineMarkCount += 2
      }
    } else {
      for (const measure of dataSelection.measures.size) {
        if (measure.markSettings.markType === "bar") {
          barMarkCount += 1
        } else {
          lineMarkCount += 1
        }
      }
    }
  }

  const showPercentage = barMarkCount + lineMarkCount > 1

  if (barMarkCount > 1) {
    return (
      <BarStackingInput
        selected={selected}
        setSelected={setSelected}
        showPercentage={showPercentage}
      />
    )
  } else if (barMarkCount === 0 && lineMarkCount > 0) {
    return (
      <LineStackingInput
        selected={selected}
        setSelected={setSelected}
        showPercentage={showPercentage}
      />
    )
  } else {
    return null
  }
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const chart = charts[chartId]

  const dataSelections = chart.dataSelections
  const groupingMode = chart.presentation.baseDimensionAxis.groupingMode
  const orientation = chart.presentation.orientation
  const rangeChartEnabled = chart.rangeChartEnabled
  const legendEnabled = isLegendEnabled(chart)
  const gridEnabled = isGridEnabled(chart)
  const barValuesEnabled = chart.barValuesEnabled
  const scaleType =
    chart.presentation.sizeMeasurePrimaryAxis?.scaleType ?? SCALE_TYPES.LINEAR
  return {
    dataSelections,
    groupingMode,
    orientation,
    rangeChartEnabled,
    legendEnabled,
    gridEnabled,
    barValuesEnabled,
    scaleType
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    setGroupingMode(groupingMode: BaseDimensionAxisSettings["groupingMode"]) {
      dispatch(setGroupingMode(chartId, groupingMode))
    },
    setOrientation(orientation: VegaComboPresentationSettings["orientation"]) {
      dispatch(setOrientation(chartId, orientation))
    },
    setRangeChartEnabled(enabled: boolean) {
      dispatch(setRangeChartEnabled(chartId, enabled))
    },
    setLegendEnabled(enabled: boolean) {
      dispatch(setLegendEnabled(chartId, enabled))
    },
    setGridEnabled(enabled: boolean) {
      dispatch(setGridEnabled(chartId, enabled))
    },
    setBarValuesEnabled(enabled: boolean) {
      dispatch(setBarValuesEnabled(chartId, enabled))
    },
    setScaleType(scaleType: ScaleType) {
      dispatch(setScaleType(chartId, scaleType))
    }
  }
})

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const FeaturedSettings: FC<Props> = ({
  dataSelections,
  groupingMode,
  orientation,
  rangeChartEnabled,
  legendEnabled,
  gridEnabled,
  barValuesEnabled,
  scaleType,
  actions
}) => {
  return (
    <>
      <ChartOrientationInput
        selected={orientation}
        setChartOrientation={actions.setOrientation}
      />
      <StackingInput
        dataSelections={dataSelections}
        selected={groupingMode}
        setSelected={actions.setGroupingMode}
      />
      <div className="switch-with-label">
        <div>Show range chart</div>
        <Switch
          checked={rangeChartEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setRangeChartEnabled(event.currentTarget.checked)
          }}
        />
      </div>
      <div className="switch-with-label">
        <div>Show legend</div>
        <Switch
          checked={legendEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setLegendEnabled(event.currentTarget.checked)
          }}
        />
      </div>
      <div className="switch-with-label">
        <div>Show grid lines</div>
        <Switch
          checked={gridEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setGridEnabled(event.currentTarget.checked)
          }}
        />
      </div>
      <div className="switch-with-label">
        <div>Show bar values</div>
        <Switch
          checked={barValuesEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setBarValuesEnabled(event.currentTarget.checked)
          }}
        />
      </div>
      <div className="switch-with-label">
        <div>Scale type</div>
        <ScaleTypeSelector
          currentScale={
            groupingMode === GROUPING_MODES.PERCENT
              ? SCALE_TYPES.LINEAR
              : scaleType
          }
          onChange={(value: string) => {
            actions.setScaleType(value)
          }}
          disabled={groupingMode === GROUPING_MODES.PERCENT}
        />
      </div>
    </>
  )
}

export default connector(FeaturedSettings)
