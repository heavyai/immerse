// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect } from "react"
import { connect } from "react-redux"
import {
  BinnedTimeDimensionScaleSettings,
  BinnedTimeUnit,
  TimeLagSettings
} from "vega/charts/types"
import {
  setChartTimeLagInterval,
  setTimeLagMeasureMode
} from "vega/actions/time-lag-settings-action-creators"
import {
  setChartTimeLag,
  clearChartTimeLag,
  toggleBaseMeasureTimeLag
} from "vega/actions/time-lag-settings-thunks"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import MeasuresToCompare from "./MeasuresToCompare"
import "./styles.scss"
import {
  ComboDataSelection,
  ComboSizeMeasureExpression,
  TimeLagMode
} from "vega/constants/data-selection-types"

type OwnProps = {
  chartId: string
  layerId: string
}

type StateProps = {
  binSettings: BinnedTimeDimensionScaleSettings
  timeLagSettings: TimeLagSettings
  timeComparisonEligible: boolean
  sizeMeasures: ComboSizeMeasureExpression[]
}

type Props = OwnProps & StateProps
type MultiSelectOption = { label: string; value: string }

const timeLagOptionsMap: Record<
  BinnedTimeUnit, // Specifically the TIME_INTERVALS subset from `time-helpers`
  MultiSelectOption[]
> = {
  millisecond: [
    { label: "1 Millisecond", value: "1 milliseconds" },
    { label: "5 Milliseconds", value: "5 milliseconds" },
    { label: "10 Milliseconds", value: "10 milliseconds" },
    { label: "25 Milliseconds", value: "25 milliseconds" },
    { label: "50 Milliseconds", value: "50 milliseconds" },
    { label: "100 Milliseconds", value: "100 milliseconds" },
    { label: "250 Milliseconds", value: "250 milliseconds" }
  ],
  second: [
    { label: "1 Second", value: "1 seconds" },
    { label: "5 Seconds", value: "5 seconds" },
    { label: "10 Seconds", value: "10 seconds" },
    { label: "15 Seconds", value: "15 seconds" },
    { label: "30 Seconds", value: "30 seconds" },
    { label: "1 Minute", value: "60 seconds" }
  ],
  minute: [
    { label: "1 Minute", value: "1 minutes" },
    { label: "5 Minutes", value: "5 minutes" },
    { label: "10 Minutes", value: "10 minutes" },
    { label: "1 Hour", value: "60 minutes" }
  ],
  hour: [
    { label: "1 Hour", value: "1 hours" },
    { label: "1 Day", value: "1 days" }
  ],
  day: [
    { label: "1 Day", value: "1 days" },
    { label: "7 Days", value: "7 days" },
    { label: "28 Days", value: "28 days" },
    { label: "365 Days", value: "365 days" }
  ],
  week: [
    { label: "1 Week", value: "7 days" },
    { label: "4 Weeks", value: "28 days" },
    { label: "12 Weeks", value: "84 days" },
    { label: "26 Weeks", value: "182 days" },
    { label: "52 Weeks", value: "364 days" }
  ],
  month: [
    { label: "1 Month", value: "1 months" },
    { label: "3 Months", value: "3 months" },
    { label: "6 Months", value: "6 months" },
    { label: "12 Months", value: "12 months" }
  ],
  quarter: [
    { label: "1 Quarter", value: "3 months" },
    { label: "4 Quarters", value: "12 months" }
  ],
  year: [{ label: "1 Year", value: "1 years" }],
  decade: [{ label: "1 Decade", value: "1 decades" }]
}

const isTimeComparisonEligible = (
  binSettings?: BinnedTimeDimensionScaleSettings,
  dimensions?: ComboDataSelection["dimensions"]
) => {
  if (
    binSettings?.dimensionType !== "binned_time" ||
    binSettings?.timeUnit === "auto" ||
    dimensions?.color
  ) {
    return false
  }
  return true
}

const TimeComparisonComponent: FC<Props> = ({
  binSettings,
  timeLagSettings,
  timeComparisonEligible,
  actions,
  sizeMeasures
}) => {
  useEffect(() => {
    if (
      timeLagSettings &&
      (!timeComparisonEligible ||
        timeLagSettings.binnedTimeUnit !== binSettings?.timeUnit)
    ) {
      actions.clearChartTimeLag()
    }
  }, [timeComparisonEligible, binSettings, timeLagSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!timeComparisonEligible) {
    return null
  }

  const timeLagOptions = [
    ...timeLagOptionsMap[binSettings.timeUnit as BinnedTimeUnit]
  ]
  if (timeLagSettings) {
    timeLagOptions.unshift({ label: "Remove", value: "" })
  }

  return (
    <>
      <div className="chart-editor-section-header">
        <div className="chart-editor-label">Time Comparison</div>
      </div>
      <div className="time-comparison-container">
        <MultiSelect
          placeholder="Time Lag"
          options={timeLagOptions}
          value={
            timeLagSettings
              ? {
                  label: timeLagSettings.label,
                  value: timeLagSettings.interval
                }
              : "Time Lag"
          }
          onChange={(option: MultiSelectOption) => {
            if (!option.value) {
              actions.clearChartTimeLag()
            } else if (!timeLagSettings) {
              actions.setChartTimeLag({
                binnedTimeUnit: binSettings.timeUnit,
                label: option.label,
                interval: option.value,
                showDelta: false
              })
            } else {
              actions.setChartTimeLagInterval(option.label, option.value)
            }
          }}
        />
        {timeLagSettings && sizeMeasures.length ? (
          <MeasuresToCompare
            sizeMeasures={sizeMeasures}
            onMeasureToggle={actions.toggleBaseMeasureTimeLag}
            onMeasureModeChange={actions.setTimeLagMeasureMode}
          />
        ) : null}
      </div>
    </>
  )
}

const mapStateToProps = ({ charts }) => {
  return { charts }
}

const mapDispatchToProps = (dispatch, { chartId, layerId }: OwnProps) => ({
  actions: {
    setChartTimeLag(timeLagSettings: TimeLagSettings) {
      dispatch(setChartTimeLag(chartId, timeLagSettings))
    },
    clearChartTimeLag() {
      dispatch(clearChartTimeLag(chartId))
    },
    setChartTimeLagInterval(label: string, interval: string) {
      dispatch(setChartTimeLagInterval(chartId, label, interval))
    },
    toggleBaseMeasureTimeLag(measureIndex: number) {
      dispatch(toggleBaseMeasureTimeLag(chartId, layerId, measureIndex))
    },
    setTimeLagMeasureMode(timeLagMeasureId: string, mode: TimeLagMode) {
      dispatch(setTimeLagMeasureMode(chartId, layerId, timeLagMeasureId, mode))
    }
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { binSettings, timeLagSettings, dataSelections } = stateProps.charts[
    ownProps.chartId
  ]
  const {
    measures: { size: sizeMeasures = [] },
    dimensions
  } = dataSelections.find((ds) => ds.layerId === ownProps.layerId)

  return {
    ...dispatchProps,
    ...ownProps,
    binSettings,
    timeLagSettings,
    sizeMeasures,
    timeComparisonEligible: isTimeComparisonEligible(binSettings, dimensions)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(TimeComparisonComponent)
