// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import NotchedOutline from "@material/react-notched-outline"
import FloatingLabel from "@material/react-floating-label"

import Popover from "components/popover/popover"
import IconTriangleDown from "components/svg-icons/icon-triangle-down"

import {
  setNumberOfBins,
  setBinningManualMinMax
} from "vega/actions/bin-settings-action-creators"
import { setChartBin, clearChartBin } from "vega/actions/bin-settings-thunks"
import { AppState, VegaComboChart, ComputedMinMax } from "vega/charts/types"
import NumericalDimBinning from "vega/components/NumericalDimBinning/NumericalDimBinning"
import { createNumericScaleSettings } from "vega/utils/binning"
import {
  getLatestBeatData,
  getComputedMinMax,
  getDataMinMax,
  isSupportsTimeScale,
  isSupportsNumericalScale
} from "vega/utils/data"

import "./styles.scss"

type OwnProps = {
  chartId: string
}

const mapStateToProps = ({ charts }: AppState, { chartId }: OwnProps) => {
  const chart = charts[chartId] as VegaComboChart
  const { binSettings, data, dataSelections } = chart

  const isMultilayer = dataSelections.length > 1
  const isMultiBaseDimensions = dataSelections.some(
    (ds) => ds.dimensions.xAxis.length > 1
  )

  const supportsTimeScale = isSupportsTimeScale(dataSelections)
  const supportsNumericScale = isSupportsNumericalScale(dataSelections)

  // Numerical binning ON/OFF toggle is disabled when we have
  // 1. multiple base dimensions selected for a layer
  // 2. one of the layers' base dimension is categorical in VDF
  const disableBinningToggle =
    isMultiBaseDimensions ||
    (isMultilayer && !supportsNumericScale && !supportsTimeScale)

  // The min/max of the data, disregarding any manual overrides
  let dataMinMax: ComputedMinMax | null = null

  // The computed min/max based on both the data and any manual overrides
  let computedMinMax: ComputedMinMax | null = null

  if (binSettings?.dimensionType === "binned_numeric" && data) {
    // Take minmax results from focus chart as source of truth
    const minmaxData = data.focus
      .map(getLatestBeatData)
      .map((beatData) =>
        beatData ? beatData.minmax || beatData.fullMinMax : null
      )

    dataMinMax = getDataMinMax(minmaxData)
    computedMinMax = getComputedMinMax(minmaxData, binSettings)
  }

  return {
    binSettings,
    isMultilayer,
    disableBinningToggle,
    dataMinMax,
    computedMinMax
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    toggleBinning(isBinned: boolean) {
      if (isBinned) {
        dispatch(clearChartBin(chartId))
      } else {
        dispatch(setChartBin(chartId, createNumericScaleSettings()))
      }
    },
    numberOfBinningChange(numOfBins: number) {
      dispatch(setNumberOfBins(chartId, numOfBins))
    },
    binningMinMaxChange(minMax: [number, number]) {
      dispatch(setBinningManualMinMax(chartId, minMax))
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
const NumericalBinningSubComponent: FC<Props> = ({
  binSettings,
  isMultilayer,
  disableBinningToggle,
  dataMinMax,
  computedMinMax,
  actions
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  // closes Numerical Bin Dropdown when clicking outside
  const handleCloseDropdown = () => {
    setMenuIsOpen(false)
  }

  // toggles Numerical Bin Dropdown when clicking on the input
  const handleToggleDropdown = () => {
    setMenuIsOpen(!menuIsOpen)
  }

  return (
    <div className="selector-sub-section">
      <Popover isOpened onClose={handleCloseDropdown}>
        <div className="num-bin-wrapper" onClick={handleToggleDropdown}>
          <div className="num-bin-section-value">
            {binSettings && binSettings.numOfBins
              ? Math.round(binSettings.numOfBins)
              : "Off"}
          </div>
          <div className="arrow-icon-wrapper">
            <IconTriangleDown />
          </div>
        </div>
        <NotchedOutline notch>
          <FloatingLabel className={"floating-label"} float>
            Bin
          </FloatingLabel>
        </NotchedOutline>
        {menuIsOpen && (
          <NumericalDimBinning
            binSettings={binSettings}
            dataMinMax={dataMinMax}
            computedMinMax={computedMinMax}
            isMultilayer={isMultilayer}
            disableBinningToggle={disableBinningToggle}
            onToggleBinning={actions.toggleBinning}
            onNumberOfBinsChange={actions.numberOfBinningChange}
            onCurrentMinMaxChange={actions.binningMinMaxChange}
          />
        )}
      </Popover>
    </div>
  )
}

export default connector(NumericalBinningSubComponent)
