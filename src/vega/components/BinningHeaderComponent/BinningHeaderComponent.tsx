// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import cx from "classnames"

import {
  BIN_TRANSLATION,
  EXTRACT_TRANSLATION,
  EXTRACT_OPTIONS
} from "utils/time-helpers"

import { setNumberOfBins } from "vega/actions/bin-settings-action-creators"
import {
  setTimeBinningWithUnit,
  setExtractBinningWithUnit,
  clearChartBin
} from "vega/actions/bin-settings-thunks"
import {
  AppState,
  ComputedMinMax,
  isBinnedTimeUnit,
  isExtractTimeUnit
} from "vega/charts/types"
import NumericalDimBinningSimple from "vega/components/NumericalDimBinning/NumericalDimBinningSimple"
import {
  getAutoBinUnit,
  getTimeBinOptionsInRange,
  getMaxTimeBins
} from "vega/utils/binning"
import { countTopNGroups } from "vega/charts/top-n-utils"
import { getLatestBeatData, getComputedMinMax } from "vega/utils/data"

import "./styles.scss"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { HIDE_VEGA_COMBO_CHART_DATE_BIN_UNITS } = available_feature_flags

type OwnProps = {
  chartId: string
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const chart = charts[chartId]
  const { binSettings, data, dataSelections } = chart

  // The computed min/max based on both the data and any manual overrides
  let computedMinMax: ComputedMinMax | null = null
  let maxTimeBins: number | undefined = undefined

  if (
    data &&
    (binSettings?.dimensionType === "binned_numeric" ||
      binSettings?.dimensionType === "binned_time")
  ) {
    // Take minmax results from focus chart as source of truth
    const minmaxData = data.focus
      .map(getLatestBeatData)
      .map((beatData) => (beatData ? beatData.minmax : null))

    computedMinMax = getComputedMinMax(minmaxData, binSettings)
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
    maxTimeBins
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    updateNumberOfBins(numOfBins: number) {
      dispatch(setNumberOfBins(chartId, numOfBins))
    },
    updateBinInterval(timeBin: string) {
      if (timeBin === "off") {
        dispatch(clearChartBin(chartId))
      } else if (isBinnedTimeUnit(timeBin)) {
        dispatch(setTimeBinningWithUnit(chartId, timeBin))
      } else {
        throw new Error(`Not a binned time unit: ${timeBin}`)
      }
    },
    updateExtractInterval(timeBin: string) {
      if (isExtractTimeUnit(timeBin)) {
        dispatch(setExtractBinningWithUnit(chartId, timeBin))
      } else {
        throw new Error(`Not an extract time unit: ${timeBin}`)
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

const hideDateBinUnits = getFeatureFlag(HIDE_VEGA_COMBO_CHART_DATE_BIN_UNITS)

const BinningHeaderComponent: FC<Props> = ({
  binSettings,
  computedMinMax,
  maxTimeBins,
  actions
}) => {
  const onSelectBin = (binValue) => () => {
    actions.updateBinInterval(binValue)
  }

  const onSelectExtract = (binValue) => () => {
    actions.updateExtractInterval(binValue)
  }

  if (binSettings?.dimensionType === "extract_time") {
    const selectedExtract =
      EXTRACT_OPTIONS.find((eo) => eo.value === binSettings.timeUnit) || null

    if (selectedExtract === null) {
      throw new Error("Couldn't find extract option for time unit")
    }

    return (
      <div
        className="chart-panel-binning-wrapper"
        data-ui-config-id="top-controls"
      >
        <div
          className={cx("time-bin-list", {
            hidden: hideDateBinUnits
          })}
        >
          {EXTRACT_OPTIONS.map((bin, i) => (
            <a
              className={cx("time-bin-element", {
                selected: binSettings.timeUnit === bin.value
              })}
              onClick={onSelectExtract(bin.value)}
              key={`time-bin-element${i}`}
              title={bin.label}
            >
              {EXTRACT_TRANSLATION[bin.value]}
            </a>
          ))}
        </div>
      </div>
    )
  } else if (
    binSettings?.dimensionType === "binned_numeric" &&
    computedMinMax
  ) {
    return (
      <div
        className="chart-panel-binning-wrapper"
        data-ui-config-id="top-controls"
      >
        {"# of bins: "}
        <NumericalDimBinningSimple
          binSettings={binSettings}
          updateNumberOfBins={actions.updateNumberOfBins}
        />
      </div>
    )
  } else if (binSettings?.dimensionType === "binned_time" && computedMinMax) {
    // The available time bin options are dynamic, based on the min/max range
    // It will always at least have "auto", even if minmax is null
    const binningOptions = getTimeBinOptionsInRange(computedMinMax, maxTimeBins)
    const autoBinUnit = getAutoBinUnit(computedMinMax, maxTimeBins)

    return (
      <div
        className="chart-panel-binning-wrapper"
        data-ui-config-id="top-controls"
      >
        <div
          className={cx("time-bin-list", {
            hidden: hideDateBinUnits
          })}
        >
          {binningOptions.map((bin, i) => (
            <a
              className={cx("time-bin-element", {
                selected:
                  binSettings.timeUnit === bin.value ||
                  (binSettings.timeUnit === "auto" &&
                    (bin.value === "auto" || autoBinUnit === bin.value))
              })}
              onClick={onSelectBin(bin.value)}
              key={`time-bin-element${i}`}
              title={bin.label}
            >
              {bin.value === "auto" ? "auto" : BIN_TRANSLATION[bin.value]}
            </a>
          ))}
        </div>
      </div>
    )
  } else {
    return null
  }
}

export default connector(BinningHeaderComponent)
