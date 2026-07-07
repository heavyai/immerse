// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  formatDataPoint,
  formatTooltipTitle
} from "import-shims/heavyai-d3-combo-chart"
import { immerseAutoFormatter } from "utils/auto-formatter"

const getFormatForDataPoint = (dataPoint, measureFormats) =>
  measureFormats.find((format) => format.key === dataPoint.label)

export const formatDataPointXValue = (
  dataPointX,
  dimensionFormats,
  dateFormat,
  binningResolution
) =>
  formatTooltipTitle(
    dataPointX,
    immerseAutoFormatter(dimensionFormats) || "auto",
    dateFormat,
    binningResolution
  )

export const getFormattedDataSourcesValues = (
  dataSources,
  dataPoints,
  measureFormats,
  yAxisPercentageFormat
) =>
  Object.keys(dataSources).reduce((dataSourcesValues, mdsiKey) => {
    const mdsi = dataSources[mdsiKey].index
    const valuesForMDSI = dataPoints.filter((d) => d.sourceIndex === mdsi)
    return valuesForMDSI.length
      ? {
          ...dataSourcesValues,
          [mdsiKey]: valuesForMDSI.map((d) => {
            const format = getFormatForDataPoint(d, measureFormats)
            const measureFormatter = format
              ? immerseAutoFormatter([format]) || "auto"
              : null

            return {
              dataPointId: d.id,
              value: formatDataPoint(
                d,
                "auto",
                yAxisPercentageFormat,
                measureFormatter
              )
            }
          })
        }
      : { ...dataSourcesValues }
  }, {})
