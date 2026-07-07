// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getSavedColorOrDefault } from "vega/charts/top-n-utils"
import { VegaCustomizableTopNOptions } from "vega/charts/types"
import { BoxPlotDataSelection } from "vega/constants/data-selection-types"
import { PaletteMapping } from "components/shared-settings/types"

export const transformData = (
  data: Array<Record<string, any>>,
  dataSelection: BoxPlotDataSelection,
  topNOptions: VegaCustomizableTopNOptions | null = null,
  paletteMappings: Array<PaletteMapping> = []
) => {
  const transformedData = []
  const numDimensions = dataSelection.dimensions.xAxis.length

  for (const d of data) {
    const dimensions = [d.dimension0]
    // let dimensionFormatted = dimensionFormatter(d.dimension0)

    for (let i = 1; i < numDimensions; i += 1) {
      const dim = d[`dimension${i}`]
      dimensions.push(dim)
      // dimensionFormatted += ` / ${dimensionFormatter(dim)}`
      // annotationKeyObj.dimensions[
      //   dimExprToStr(dataSelection.dimensions.xAxis[i])
      // ] = dimensionScaler(dim)
    }
    const dimension = JSON.stringify(dimensions)

    const paletteMapping = paletteMappings.find(
      (pm) => pm.id === dataSelection.paletteMappingId
    )
    const colorSettings =
      topNOptions?.dynamicValues?.find((dv) => dv.key === d.dimension0) ?? {}

    if (!colorSettings.disabled) {
      transformedData.push({
        ...d,
        categoricalColor: getSavedColorOrDefault(
          d.dimension0,
          topNOptions,
          paletteMapping
        ),
        dimension
      })
    }
  }

  return transformedData
}

/**
 * Not all bucketNumebrs are returned for every dimension value, this fills in the gaps
 * to keep vega looking nice. Otherwise interpolation gets weird.
 *
 * We can limit buckets/dim values accordingly to keep us in a reasonable range here
 * Quick benchmark:
 *   125 dimension values + 400 buckets each = 3.5ms
 *   125 dimension values + 40 buckets each = 0.5ms
 *
 * @param violinData - Raw violin query data
 * @returns Array of all buckets for all dimension values, fills in any missing buckets with 0s
 */
const fillViolinBuckets = (
  violinData: any[],
  layerTopNOptions: VegaCustomizableTopNOptions,
  violinDistributionPrecision: number,
  dataSelection: BoxPlotDataSelection,
  paletteMappings: Array<PaletteMapping>
) => {
  const paletteMapping = paletteMappings.find(
    (pm) => pm.id === dataSelection.paletteMappingId
  )

  const dataByDim = violinData.reduce((acc, d) => {
    const dimValue = d.dimensionColor
    if (!acc[dimValue]) {
      acc[dimValue] = []
    }
    acc[dimValue][d.bucketNumber] = {
      ...d,
      categoricalColor: getSavedColorOrDefault(
        dimValue,
        layerTopNOptions,
        paletteMapping
      ),
      dimension0: d.dimensionColor,
      dimension: JSON.stringify([d.dimensionColor])
    }

    return acc
  }, {})

  const bucketsComplete = Object.entries(dataByDim)
    .map(([dimensionColor, buckets]) => {
      return new Array(violinDistributionPrecision).fill(0).map((_, i) => {
        return i in buckets
          ? buckets[i]
          : {
              dimensionColor,
              bucketNumber: i,
              bucketCount: 0,
              categoricalColor: getSavedColorOrDefault(
                dimensionColor,
                layerTopNOptions,
                paletteMapping
              ),
              dimension0: dimensionColor,
              dimension: JSON.stringify([dimensionColor])
            }
      })
    })
    .flat()
  return bucketsComplete
}

export const transformViolinData = (
  violinData,
  layerTopNOptions,
  violinDistributionPrecision,
  dataSelection,
  paletteMappings = []
) => {
  const visibleViolinData = violinData.filter((vd: Record<string, any>) => {
    const colorSettings =
      layerTopNOptions?.dynamicValues?.find(
        (dv) => dv.key === vd.dimensionColor
      ) ?? {}
    return !colorSettings.disabled
  })
  return fillViolinBuckets(
    visibleViolinData,
    layerTopNOptions,
    violinDistributionPrecision,
    dataSelection,
    paletteMappings
  )
}
