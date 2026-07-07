// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import compose from "recompose/compose"
import CustomSelector from "components/custom-selector/custom-selector"
import cx from "classnames"
import mapProps from "recompose/mapProps"
import { NUM_BINS_FOR_TIME } from "constants/data-types"
import withHandlers from "recompose/withHandlers"
import withState from "recompose/withState"
import { TIME_SPANS } from "utils/time-helpers"

const isLineOrHistogram = (chartType) =>
  chartType === "line" || chartType === "line2" || chartType === "histogram"

const currentValue = (timeBin) =>
  !timeBin || timeBin === "" || timeBin === "auto" ? "isodow" : timeBin

const sortedTimeSpans = [...TIME_SPANS].sort(
  (a, b) => b.numSeconds - a.numSeconds
)

export const BINNING_INTERVAL_OPTIONS = [
  { value: "auto", label: "Auto" },
  ...sortedTimeSpans
]

export const EXTRACT_INTERVAL_OPTIONS = [
  { value: "year", label: "Year" },
  { value: "quarter", label: "Quarter" },
  { value: "month", label: "Month" },
  { value: "day", label: "Day of Month" },
  { value: "isodow", label: "Day of Week" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" }
]

function maxNumberOfRenderPoints(chartType) {
  switch (chartType) {
    case "table":
      return Infinity
    default:
      return NUM_BINS_FOR_TIME
  }
}

export function boundsToRangeSecs(start, end) {
  const ONE_SECOND_IN_MS = 1000
  return Math.abs((start.getTime() - end.getTime()) / ONE_SECOND_IN_MS)
}

export function createOptions({ binning, binBounds, chartType }) {
  if (binning) {
    if (binBounds[0] === null || binBounds[1] === null) {
      return []
    } else {
      const rangeInSeconds = boundsToRangeSecs(...binBounds)
      return BINNING_INTERVAL_OPTIONS.filter(({ numSeconds }) => {
        const overMax =
          rangeInSeconds / numSeconds > maxNumberOfRenderPoints(chartType)
        const underMin = rangeInSeconds / numSeconds < 2
        if (isLineOrHistogram(chartType)) {
          return !(overMax || underMin)
        } else {
          return !overMax
        }
      })
    }
  } else {
    return EXTRACT_INTERVAL_OPTIONS
  }
}

const withToggleState = compose(
  withState("binning", "toggle", ({ dimension: { extract } }) => !extract),
  withHandlers({
    onBinningClick: (props) => () => {
      const options = createOptions({ ...props, binning: true })
      const interval = options
        .map((d) => d.value)
        .reduce((p, c) => (p === "day" ? p : c))
      props.updateBinInterval(interval)
      props.toggle(() => true)
    },
    onExtractClick: (props) => () => {
      const selectedTimeBin = props.dimension && props.dimension.timeBin
      const timeBinIsValidExtract =
        selectedTimeBin &&
        EXTRACT_INTERVAL_OPTIONS.some(
          (extractOption) => extractOption.value === props.dimension.timeBin
        )
      const timeBin =
        selectedTimeBin && timeBinIsValidExtract ? selectedTimeBin : "isodow"
      props.updateExtractInterval(timeBin)
      props.toggle(() => false)
    }
  })
)

const propsMapper = (props) => ({
  allowsExtract: !isLineOrHistogram(props.chartType),
  onChange: props.binning
    ? props.updateBinInterval
    : props.updateExtractInterval,
  options: createOptions(props),
  currentValue: currentValue(props.timeBinInputVal),
  ...props
})

DimensionTimeBinSettings.propTypes = {
  allowsExtract: PropTypes.bool.isRequired,
  binning: PropTypes.bool.isRequired,
  currentValue: PropTypes.string.isRequired,
  onBinningClick: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onExtractClick: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ).isRequired
}

export function DimensionTimeBinSettings(props) {
  return (
    <div className="time-bin-settings-popover">
      <div className="button-group">
        <button
          className={cx("button", { active: props.binning })}
          data-testid="binning-switcher"
          onClick={props.onBinningClick}
        >
          {"Binning"}
        </button>
        <button
          className={cx("button", { active: !props.binning })}
          data-testid="extract-switcher"
          onClick={props.onExtractClick}
        >
          {"Extract"}
        </button>
      </div>
      <div className="header">
        {`${props.binning ? "Bin" : "Extract"} Unit`}
      </div>
      <div className="dropdown-container">
        <CustomSelector
          className="sort-by-dropdown"
          currentValue={props.currentValue}
          onChange={props.onChange}
          options={props.options}
        />
      </div>
    </div>
  )
}

export default compose(
  withToggleState,
  mapProps(propsMapper)
)(DimensionTimeBinSettings)
