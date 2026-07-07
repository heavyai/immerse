// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Switch } from "widgets/switch/Switch"

import IconChain from "components/svg-icons/icon-chain"

import {
  BinnedNumericDimensionScaleSettings,
  ComputedMinMax
} from "vega/charts/types"
import NumericalSlider from "vega/components/NumericalSlider/NumericalSlider"
import RangeSlider from "vega/components/RangeSlider/RangeSlider"
import { MAX_NUM_OF_BINS } from "vega/utils/binning"

import "./styles.scss"

type Props = {
  binSettings: BinnedNumericDimensionScaleSettings | null
  dataMinMax: ComputedMinMax | null
  computedMinMax: ComputedMinMax | null
  isMultilayer: boolean
  disableBinningToggle: boolean
  onToggleBinning: (v: boolean) => void
  onNumberOfBinsChange: (v: number) => void
  onCurrentMinMaxChange: (v: [number, number]) => void
}

const NumericalDimBinning: FC<Props> = ({
  binSettings,
  dataMinMax,
  computedMinMax,
  isMultilayer,
  disableBinningToggle,
  onToggleBinning,
  onNumberOfBinsChange,
  onCurrentMinMaxChange
}) => {
  if (binSettings && computedMinMax) {
    const { numOfBins } = binSettings

    // Just use computed min/max if data min/max unavailable - this
    // can happen if both manual min and max are set, meaning that
    // no min/max query is sent.
    const { min: dataMin, max: dataMax } = dataMinMax || computedMinMax
    const { min, max } = computedMinMax

    if (
      typeof min !== "number" ||
      typeof max !== "number" ||
      typeof dataMin !== "number" ||
      typeof dataMax !== "number"
    ) {
      throw new Error("Unexpected non-numeric min/max type")
    }

    const range = max - min
    const binSize = range / numOfBins
    const binSizeMax = range
    const binSizeMin = range / MAX_NUM_OF_BINS

    const multilayerLabel = "across all layers"

    const handleBinSizeChange = (newBinSize: number) => {
      // # of Bins is the dictating variable, and it has to be a whole number from 1 to 250
      // The Bin size depends on # of Bins, so when user enters a floating number for Bin size
      // slider value, we first get the rounded num of bins then use the rounded number to readjust
      // the bin size slider value
      const roundedNumOfBins = Math.min(
        Math.round(range / newBinSize),
        MAX_NUM_OF_BINS
      )
      onNumberOfBinsChange(roundedNumOfBins)
    }

    return (
      <div className="numerical-bin-container">
        <div className="binning-toggle_wrapper">
          <div className="binning-toggle-label">Enable binning</div>
          <Switch
            disabled={disableBinningToggle}
            checked
            onChange={() => onToggleBinning(true)}
            inputprops={{ "aria-label": "secondary checkbox" }}
          />
        </div>
        {binSettings && (
          <div className="binning-sliders-container">
            <div className="number-size-slider-wrapper">
              <div className="number-size-sliders">
                <NumericalSlider
                  label={
                    isMultilayer ? `# of bins ${multilayerLabel}` : "# of bins"
                  }
                  max={250}
                  min={1}
                  step={1}
                  value={Math.round(numOfBins)}
                  onChange={onNumberOfBinsChange}
                />
                <NumericalSlider
                  label={
                    isMultilayer ? `Bin size ${multilayerLabel}` : "Bin size"
                  }
                  max={binSizeMax}
                  min={binSizeMin}
                  step={1}
                  textInputStep={"any"} // we would allow any number in Numerical dim binning min/max slider, a whole number or float
                  value={binSize}
                  onChange={handleBinSizeChange}
                />
              </div>
              <div className="icon-chain-wrapper">
                <IconChain />
              </div>
            </div>
            <div className="range-slider-wrapper">
              <RangeSlider
                label={
                  isMultilayer
                    ? `Bin range ${multilayerLabel}`
                    : "Bin range min/max"
                }
                min={Math.min(dataMin, min)}
                max={Math.max(dataMax, max)}
                step={1}
                textInputStep={"any"} // we would allow any number in Numerical dim binning min/max slider, a whole number or float
                value={[min, max]}
                onChange={onCurrentMinMaxChange}
              />
            </div>
          </div>
        )}
      </div>
    )
  } else {
    return (
      <div className="numerical-bin-container">
        <div className="binning-toggle_wrapper">
          <div className="binning-toggle-label">Enable binning</div>
          <Switch
            disabled={disableBinningToggle}
            checked={false}
            onChange={() => onToggleBinning(false)}
            inputprops={{ "aria-label": "secondary checkbox" }}
          />
        </div>
      </div>
    )
  }
}

export default NumericalDimBinning
