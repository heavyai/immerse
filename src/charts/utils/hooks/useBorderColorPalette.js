// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { DEFAULT_POLY_BORDER_COLOR } from "charts/raster-chart/raster-chart-consts"

export const useBorderColorPalette = () => {
  const borderColorPalette = useSelector((state) => {
    return [...getUserConfigurableUISettings(state).colorPalettes.solid]
  })

  if (!borderColorPalette.find((hex) => hex === DEFAULT_POLY_BORDER_COLOR)) {
    borderColorPalette.unshift(DEFAULT_POLY_BORDER_COLOR)
  }
  return borderColorPalette
}
