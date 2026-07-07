// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ScaleType } from "constants/scale-types"

type SolidColorPalette = {
  type: "solid"
  name: string
}

type OrdinalColorPalette = {
  type: "ordinal"
  name: string
}

export type CategoricalColorPalette = SolidColorPalette | OrdinalColorPalette

export type QuantitativeColorPalette = {
  type: "quantitative"
  name: string
}

export type ColorPalette = CategoricalColorPalette | QuantitativeColorPalette

export type BaseDimensionAxisSettings = {
  title?: string
  groupingMode: "grouped" | "stacked" | "percent"
  lineAreaEnabled: boolean
  format?: string | null
}

type SizeMeasureAxisSettings = {
  title?: string
  cumulativeDistributionEnabled: boolean
  percentageDistributionEnabled: boolean
  format?: string | null
  manualDomainMin?: number | null
  manualDomainMax?: number | null
  scaleType?: ScaleType
}

export type VegaComboPresentationSettings = {
  orientation: "column" | "row"
  gridEnabled: boolean
  barValuesEnabled: boolean
  baseDimensionAxis: BaseDimensionAxisSettings
  sizeMeasurePrimaryAxis: SizeMeasureAxisSettings
  sizeMeasureSecondaryAxis: SizeMeasureAxisSettings
}

// TODO: Update for box plot specific settings, a lot of these apply though
export type VegaBoxPlotPresentationSettings = {
  orientation: "column" | "row"
  gridEnabled: boolean
  barValuesEnabled: boolean
  baseDimensionAxis: BaseDimensionAxisSettings
  sizeMeasurePrimaryAxis: SizeMeasureAxisSettings
  sizeMeasureSecondaryAxis: SizeMeasureAxisSettings
}
