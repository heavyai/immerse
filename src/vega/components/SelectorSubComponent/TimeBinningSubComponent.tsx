// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import { MultiSelect } from "widgets/multi-select/Multi-select"

import { capitalizeFirstLetter, EXTRACT_OPTIONS } from "utils/time-helpers"

import {
  setChartBin,
  clearChartBin,
  setTimeBinningWithUnit,
  setExtractBinningWithUnit
} from "vega/actions/bin-settings-thunks"
import TimeDimBinning from "vega/components/TimeDimBinning/TimeDimBinning"
import {
  AppState,
  ComputedMinMax,
  isBinnedTimeUnit,
  isExtractTimeUnit
} from "vega/charts/types"
import { createTimeScaleSettings, getMaxTimeBins } from "vega/utils/binning"
import { countTopNGroups } from "vega/charts/top-n-utils"
import {
  getDataMinMax,
  getLatestBeatData,
  isSupportsNumericalScale,
  isSupportsTimeScale
} from "vega/utils/data"

import "./styles.scss"

type OwnProps = {
  chartId: string
}

type SelectOption = {
  label: string
  value: string
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const chart = charts[chartId]
  const { binSettings, data, dataSelections } = chart

  const isMultilayer = dataSelections.length > 1
  const isMultiBaseDimensions = dataSelections.some(
    (ds) => ds.dimensions.xAxis.length > 1
  )

  const supportsTimeScale = isSupportsTimeScale(dataSelections)
  const supportsNumericScale = isSupportsNumericalScale(dataSelections)

  // Time dimension binning is unbinned when we have
  // 1. multiple base dimensions selected for a layer
  // 2. one of the layers' base dimension is categorical in VDF
  const isUnbinned =
    isMultiBaseDimensions ||
    (isMultilayer && !supportsNumericScale && !supportsTimeScale)

  if (
    binSettings &&
    !(
      binSettings.dimensionType === "unbinned" ||
      binSettings.dimensionType === "binned_time" ||
      binSettings.dimensionType === "extract_time"
    )
  ) {
    // eslint-disable-next-line no-console
    console.warn("Only time scale expected if binSettings are defined")
  }

  let computedMinMax: ComputedMinMax | null = null
  let maxTimeBins: number | undefined = undefined

  if (data) {
    // Take minmax results from focus chart as source of truth
    const minmaxData = data?.focus
      .map(getLatestBeatData)
      .map((beatData) => (beatData ? beatData.minmax : null))

    computedMinMax = getDataMinMax(minmaxData)
    maxTimeBins = getMaxTimeBins(
      dataSelections.reduce(
        (acc, { topNoptions }) =>
          Math.max(acc, topNoptions ? countTopNGroups(topNoptions) : 0),
        1
      )
    )
  }

  return {
    binSettings,
    computedMinMax,
    maxTimeBins,
    isMultilayer,
    isUnbinned
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    binningIntervalChange(timeBin: string) {
      if (timeBin === "off") {
        dispatch(clearChartBin(chartId))
      } else if (isBinnedTimeUnit(timeBin)) {
        dispatch(setTimeBinningWithUnit(chartId, timeBin))
      } else {
        throw new Error(`Not a binned time unit: ${timeBin}`)
      }
    },
    binningExtractChange(timeBin: string) {
      if (isExtractTimeUnit(timeBin)) {
        dispatch(setExtractBinningWithUnit(chartId, timeBin))
      } else {
        throw new Error(`Not an extract time unit: ${timeBin}`)
      }
    },
    toggleBinning(isBinned: boolean) {
      if (isBinned) {
        dispatch(clearChartBin(chartId))
      } else {
        dispatch(setChartBin(chartId, createTimeScaleSettings()))
      }
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

/**
 * Component Used for numerical and data/time type dimension binning and
 * numerical measures aggregate
 */
const TimeBinningSubComponent: FC<Props> = ({
  binSettings,
  computedMinMax,
  maxTimeBins,
  isUnbinned,
  actions
}) => {
  let selectedValue: SelectOption | undefined = undefined

  if (!binSettings || binSettings.dimensionType === "unbinned") {
    selectedValue = { value: "off", label: "Off" }
  } else if (binSettings.dimensionType === "binned_time") {
    selectedValue = {
      value: binSettings.timeUnit,
      label: capitalizeFirstLetter(binSettings.timeUnit)
    }
  } else if (binSettings.dimensionType === "extract_time") {
    selectedValue = EXTRACT_OPTIONS.find(
      (eo) => eo.value === binSettings.timeUnit
    )
  } else {
    // eslint-disable-next-line no-console
    console.warn("Unexpected non-time binSettings")
  }

  if (!selectedValue) {
    throw new Error("Invalid selected value")
  }

  const Menu = ({ innerProps }) => (
    <TimeDimBinning
      onMouseDown={innerProps.onMouseDown}
      binSettings={binSettings}
      minmax={computedMinMax}
      maxTimeBins={maxTimeBins}
      updateBinInterval={(v) => actions.binningIntervalChange(v.value)}
      updateExtractInterval={(v) => actions.binningExtractChange(v.value)}
      showExtract
      isUnbinned={isUnbinned}
      listSizeClass="compact"
    />
  )

  return (
    <div className="selector-sub-section">
      <div className="multi-select-container">
        <div className="multiselect-wrapper" />
        <MultiSelect
          isSearchable={false}
          noLabel={false}
          value={selectedValue}
          placeholder="Bin"
          components={{
            Menu
          }}
        />
      </div>
    </div>
  )
}

export default connector(TimeBinningSubComponent)
