// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import SingleColorPicker from "vega/components/SingleColorPicker/single-color-picker"

import { connect } from "react-redux"

import { AppState } from "vega/charts/types"

import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { OmniColorSchemes } from "services/colors"

type OwnProps = {
  selectedColor: string
  onColorChange: (markColor: string) => void
  colorPalette?: OmniColorSchemes["solid"]
}

const mapStateToProps = (
  state: AppState,
  { selectedColor, onColorChange, colorPalette }: OwnProps
) => {
  const defaultColorPalette = getUserConfigurableUISettings(state).colorPalettes
    .solid
  return {
    selectedColor,
    onColorChange,
    colorPalette: colorPalette || defaultColorPalette
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  undefined,
  OwnProps,
  AppState
>(mapStateToProps)

export default connector(SingleColorPicker)
