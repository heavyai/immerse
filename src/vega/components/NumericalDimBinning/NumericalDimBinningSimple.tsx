// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { TextField } from "widgets/text-field/TextField"

import { BinnedNumericDimensionScaleSettings } from "vega/charts/types"
import { MAX_NUM_OF_BINS } from "vega/utils/binning"

import "./styles.scss"

type Props = {
  binSettings: BinnedNumericDimensionScaleSettings
  updateNumberOfBins: (v: number) => void
}

const NumericalDimBinningSimple: FC<Props> = ({
  binSettings,
  updateNumberOfBins
}) => {
  const { numOfBins } = binSettings

  const setCurrentValueIfValid = (v: string) => {
    if (Number(v) >= 1 && Number(v) <= MAX_NUM_OF_BINS && v.match(/^\d+$/)) {
      updateNumberOfBins(Number(v))
    } else {
      return
    }
  }

  return (
    <div
      className="num_dim_bin_simple_wrapper"
      data-ui-config-id="top-controls"
    >
      <TextField
        min={1}
        max={MAX_NUM_OF_BINS}
        className="simple_num_bin"
        value={Math.round(numOfBins)}
        onChange={({ target: { value: v } }) => setCurrentValueIfValid(v)}
      />
    </div>
  )
}

export default NumericalDimBinningSimple
