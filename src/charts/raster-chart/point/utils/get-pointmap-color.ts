// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { layerDefaultOpacity } from "../../../../constants/magic-variables"
import { CHARTS_DEFAULT_COLORS, getColors } from "../../../../services/colors"
import { process } from "../../../../utils/ImmerseSQLPlusPlus/parser"
import { toTransformAgg } from "../../../../utils/selector-helpers"
import { getDisplayOrParameterName } from "utils/get-display-or-parameter-name"
import {
  getDefaultCategoricalPalette,
  filterDefaultValuesFromDomainRange,
  calculateNewRangeWithAdditionalColors
} from "reducers/charts/helpers/color-helpers"

export function getPointmapColor(
  color,
  colorMeasure,
  density,
  opacity,
  legendOpen,
  isAgg = false,
  colorDomain,
  legendLocked,
  rasterShowOther,
  dataSource,
  fullColorHashing
) {
  opacity = undefined ? layerDefaultOpacity("pointmap") : opacity
  legendOpen = typeof legendOpen === "undefined" ? true : legendOpen
  if (density && !colorMeasure?.value) {
    return {
      type: "density",
      range: color.reverse ? [...color.val].reverse() : color.val,
      opacity
    }
  } else if (color.type === "solid") {
    return { value: color.val[0], opacity }
  } else if (color.type === "custom" && !isAgg) {
    const palette = color.palette ?? getDefaultCategoricalPalette()
    const { domain, range } = filterDefaultValuesFromDomainRange(
      color.customDomain,
      color.customRange,
      palette.val
    )
    const newRange = calculateNewRangeWithAdditionalColors(range, palette.val)

    return {
      type: "ordinal",
      field: colorMeasure.value,
      label: colorMeasure.label,
      domain: fullColorHashing
        ? Array.from({ length: newRange.length }, (_, i) => i)
        : color.customDomain,
      originalDomain: color.customDomain,
      range: fullColorHashing ? newRange : color.customRange,
      originalRange: color.customRange,
      opacity,
      showOther: rasterShowOther, // flag that is controlled by Other category visibility toggle, defaults to true for all charts
      defaultOtherRange:
        color.defaultOtherRange ||
        getColors(CHARTS_DEFAULT_COLORS).custom.defaultOtherRange, // Other category color that will be used for Legend
      hideOther:
        colorMeasure.type === "BOOL" || fullColorHashing
          ? true
          : color.hideOther, // property that keeps track of existence of Other category option from topN result for the selected color measure
      legend: {
        title: `${
          colorMeasure.label
            ? process(colorMeasure.label, { useDisplayName: true })
            : colorMeasure.label
        } ${
          colorMeasure.custom
            ? "[custom]"
            : `[${getDisplayOrParameterName(dataSource)}]`
        }`,
        open: legendOpen
      },
      prioritizedColor: color.prioritizedColor,
      palette,
      fullColorHashing,
      customColors: {
        domain,
        range
      }
    }
  } else {
    // changing the color legend bounds updates colorDomain,
    const colorLegendBound = colorDomain ? colorDomain : colorMeasure.minMax
    // if user sets colorDomain, it will regard the value. If not, it will take color measure minMax

    return {
      type: "quantitative",
      field: colorMeasure.value,
      ...(isAgg ? { aggregate: toTransformAgg(colorMeasure.aggType) } : {}),
      label: colorMeasure.label,
      domain: colorDomain && legendLocked ? colorLegendBound : "auto", // we use auto when legend is not locked
      range: color.reverse ? [...color.val].reverse() : color.val,
      opacity,
      legend: {
        title: `${
          colorMeasure.label
            ? process(colorMeasure.label, { useDisplayName: true })
            : colorMeasure.label
        } ${
          colorMeasure.custom
            ? "[custom]"
            : `[${getDisplayOrParameterName(dataSource)}]`
        }`,
        open: legendOpen,
        locked: legendLocked
      }
    }
  }
}
