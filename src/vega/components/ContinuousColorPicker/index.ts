// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"

import ContinuousColorPicker from "./ContinuousColorPicker"
import { ColorPalette, VegaComboChart } from "vega/charts/types"
import { setColorMeasureColorScheme } from "vega/actions/scale-settings-action-creators"

const mapStateToProps = ({ charts }, { chartId }) => {
  const chart = charts[chartId] as VegaComboChart

  return {
    selectedColorScheme: chart.scales.colorMeasure.palette
  }
}

const mapDispatchToProps = (dispatch, { chartId }) => ({
  handleSelectColorScheme: (scheme: ColorPalette) => {
    if (scheme.type === "quantitative") {
      dispatch(setColorMeasureColorScheme(chartId, scheme))
    } else {
      throw new Error("Unsupported size measure palette")
    }
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContinuousColorPicker)
