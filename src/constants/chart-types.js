// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const OMNICOMBO = "OMNICOMBO"
export const DECKGL = "DECKGL"
export const EXPERIMENTAL = "EXPERIMENTAL"
export const NOT_BE_RENDERED = "NOT_BE_RENDERED"
export const BACKEND_RENDERED = "BACKEND_RENDERED"
export const DEPRECATED = "DEPRECATED"
export const LAYER = "LAYER"
export const MULTISOURCE = "MULTISOURCE"
export const OTHER = "OTHER"
export const GEO_MEASURE = "GEO_MEASURE"
export const DENSITY_ACCUMULATION = "DENSITY_ACCUMULATION"
export const SPECIAL = "SPECIAL"

export const CATEGORIZED_CHART_TYPES = {
  [OMNICOMBO]: {},
  [DECKGL]: {},
  [EXPERIMENTAL]: {},
  [NOT_BE_RENDERED]: {},
  [BACKEND_RENDERED]: {},
  [DEPRECATED]: {},
  [LAYER]: [],
  [MULTISOURCE]: [],
  [OTHER]: {},
  [SPECIAL]: {},
  [GEO_MEASURE]: {},
  [DENSITY_ACCUMULATION]: {}
}

export const CHART_DIMENSION_SETTINGS = {}

export const CHART_TYPES = {}

export const CHARTS_ORDER = []

const INCLUDED_CHART_TYPES = new Set([BACKEND_RENDERED, NOT_BE_RENDERED, OTHER])

export const BACKEND_CHARTS = []
export const VEGA_CHARTS = []
export const DECKGL_CHARTS = []
export const EXPERIMENTAL_CHARTS = []
export const CHART_DEFS = {}

export function addChartType({
  chartType,
  chartTypeConstant,
  chartTypeCategories,
  dimensionSettings,
  visible,
  chartDef
}) {
  chartTypeCategories.forEach((typeCategory) => {
    if (typeCategory === DENSITY_ACCUMULATION || typeCategory === GEO_MEASURE) {
      CATEGORIZED_CHART_TYPES[typeCategory][chartType] = true
    } else if (typeCategory === MULTISOURCE || typeCategory === LAYER) {
      CATEGORIZED_CHART_TYPES[typeCategory].push(chartType)
    } else {
      CATEGORIZED_CHART_TYPES[typeCategory][chartTypeConstant] = chartType
    }
    if (INCLUDED_CHART_TYPES.has(typeCategory)) {
      CHART_TYPES[chartTypeConstant] = chartType
    }
    if (typeCategory === BACKEND_RENDERED) {
      BACKEND_CHARTS.push(chartType)
    }
    if (typeCategory === OMNICOMBO) {
      VEGA_CHARTS.push(chartType)
    }
    if (typeCategory === DECKGL) {
      DECKGL_CHARTS.push(chartType)
    }
    if (typeCategory === EXPERIMENTAL) {
      EXPERIMENTAL_CHARTS.push(chartType)
    }
  })

  CHART_DIMENSION_SETTINGS[chartType] = dimensionSettings
  if (visible) {
    CHARTS_ORDER.push(chartType)
  }

  CHART_DEFS[chartType] = chartDef
}
