// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as vega from "vega"
import {
  BoxPlotData,
  TooltipTable,
  TooltipStats,
  SortedOutliersData
} from "vega/charts/box-plot-chart/types"
import { VegaCustomizableTopNOptions } from "vega/charts/types"
import { BoxPlotDataSelection } from "vega/constants/data-selection-types"
import { PaletteMapping } from "components/shared-settings/types"
import { getSavedColorOrDefault } from "vega/charts/top-n-utils"
import {
  CUSTOM_FORMATTER_TYPE,
  immerseAutoFormatter
} from "utils/auto-formatter"

export const fillTooltipData = (
  data: BoxPlotData,
  outlierData: SortedOutliersData,
  dataSelection: BoxPlotDataSelection,
  topNOptions: VegaCustomizableTopNOptions,
  paletteMappings: Array<PaletteMapping> = [],
  measureFormat?: string | null,
  measureExtents?: number[]
): TooltipTable => {
  const paletteMapping = paletteMappings.find(
    (pm) => pm.id === dataSelection.paletteMappingId
  )

  const customFormatters = Object.values(CUSTOM_FORMATTER_TYPE)
  let format = null
  if (customFormatters.includes(measureFormat as CUSTOM_FORMATTER_TYPE)) {
    format = immerseAutoFormatter(measureFormat as CUSTOM_FORMATTER_TYPE)
  } else {
    format = measureFormat
      ? vega
          .scale("customlinear")()
          .domain(measureExtents || [0, 1])
          .tickFormat(null, measureFormat)
      : (d) => (d?.toLocaleString ? d.toLocaleString("en-us") : String(d))
  }

  const stats: TooltipStats = {
    avg: format(data.measure0_avg),
    max: format(data.measure0_max),
    median: format(data.measure0_median),
    min: format(data.measure0_min),
    q1: format(data.measure0_q1),
    q3: format(data.measure0_q3),
    iqr:
      data.measure0_q3 && data.measure0_q1
        ? format(data.measure0_q3 - data.measure0_q1)
        : null,
    mode: format(data.measure0_mode),
    count: format(data.measure0_count)
  }

  if (outlierData?.top?.length > 0) {
    stats.topOutliers = outlierData.top
      .map((t) => format(t.measure0))
      .join(", ")
  }

  if (outlierData?.bottom?.length > 0) {
    stats.bottomOutliers = outlierData.bottom
      .map((t) => format(t.measure0))
      .join(", ")
  }

  return {
    dimension: data.dimension0,
    key: data.dimension0,
    color: getSavedColorOrDefault(data.dimension0, topNOptions, paletteMapping),
    stats
  }
}
