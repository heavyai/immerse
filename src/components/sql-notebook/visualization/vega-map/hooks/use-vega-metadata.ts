// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from "react"
import { LegendScale, LegendScaleType } from "../map-legend/map-legend"

export const useVegaMetadata = (chartKey: string) => {
  const [legendScales, setLegendScales] = useState<Array<LegendScale>>([])

  const setLegendData = useCallback(
    (vegaMetadata: string, vegaSpec: any) => {
      const colorScaleName = `${chartKey}_fillColor`
      const sizeScaleName = `${chartKey}_size`
      let vegaMetadataJson = {}
      try {
        vegaMetadataJson = JSON.parse(vegaMetadata)
      } catch (e) {
        // noop - Just don't show the legend if we don't have legend data
        // eslint-disable-next-line no-console
        console.log("Error parsing vega metadata from render")
      }

      // We only get continuous scales in vega metadata
      // if they use data. Domain order is not guaranteed.
      const metadataScales =
        vegaMetadataJson?.scales?.map((s: LegendScale) => ({
          ...s,
          domain: s.domain?.sort((a, b) => a - b)
        })) ?? []

      const allScales = []
      const metadataColorScales = metadataScales.filter(
        (s: any) => s.name === colorScaleName
      )
      const specColorScale = vegaSpec?.scales?.find(
        (scale: any) => scale.name === colorScaleName
      )

      const metadataSizeScales = metadataScales
        .filter((s: any) => s.name === sizeScaleName)
        .map((s: any) => ({ ...s, type: LegendScaleType.SIZE }))

      if (metadataColorScales.length) {
        allScales.push(...metadataColorScales)
      } else if (specColorScale) {
        allScales.push(specColorScale)
      }
      if (metadataSizeScales.length) {
        allScales.push(...metadataSizeScales)
      }
      setLegendScales(allScales)
    },
    [chartKey]
  )

  return [setLegendData, legendScales]
}
