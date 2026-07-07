// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import deepEquals from "fast-deep-equal"

import {
  FilterAndCohort,
  getFiltersForDataSources
} from "vega/constants/filter-metadata-types"
import { ChartState } from "reducers/charts/charts-reducer-types"
import { Dimension, Measure } from "constants/prop-types"
import { isSelectorUsable } from "utils/selector-helpers"

export type BaseDeckGLLayerQuerySpec = {
  table: string
  dimensions: Dimension[]
  popupColumns: Dimension[]
  colorMeasure?: Measure
  appliedFilters: FilterAndCohort[]
  limit: number
}

export type DeckGLPointmapLayerQuerySpec = BaseDeckGLLayerQuerySpec & {
  type: "pointmap"
  lonMeasure: Measure
  latMeasure: Measure
  altMeasure?: Measure
}

export type DeckGLLinemapLayerQuerySpec = BaseDeckGLLayerQuerySpec & {
  type: "linemap"
  geoMeasure: Measure
}

export type DeckGLChoroplethLayerQuerySpec = BaseDeckGLLayerQuerySpec & {
  type: "choropleth"
  geoMeasure: Measure
  elevationMeasure?: Measure
}

export type DeckGLLayerQuerySpec =
  | DeckGLPointmapLayerQuerySpec
  | DeckGLLinemapLayerQuerySpec
  | DeckGLChoroplethLayerQuerySpec

export const deckgl3dChartToQuerySpecs = (
  chart: ChartState,
  appliedFilters: FilterAndCohort[],
  prev: Array<DeckGLLayerQuerySpec | null> = []
): Array<DeckGLLayerQuerySpec | null> => {
  let layers = chart.layers ?? [chart]
  const currentLayer = chart.currentLayer ?? 0
  if (currentLayer !== "master") {
    layers = [...layers]
    layers[currentLayer] = chart
  }
  return layers.map((layer, layerIndex): DeckGLLayerQuerySpec | null => {
    if (currentLayer !== "master" && currentLayer !== layerIndex) {
      return null
    }

    const type = layer.type.substr(7) || "pointmap"
    const table = layer.dataSource
    const dimensions = layer.dimensions.filter(isSelectorUsable) as Dimension[]
    const measures = layer.measures.filter(isSelectorUsable) as Measure[]
    const popupColumns = (layer.hoverSelectedColumns ?? []).filter(
      isSelectorUsable
    ) as Dimension[]
    const colorMeasure = measures.find(({ name }) => name === "color")
    const base: BaseDeckGLLayerQuerySpec = {
      table,
      dimensions,
      popupColumns,
      colorMeasure,
      appliedFilters: getFiltersForDataSources(appliedFilters, [table]),
      limit: layer.cap
    }

    let spec: DeckGLLayerQuerySpec | null = null
    if (type === "pointmap") {
      spec = buildPointmapQuerySpec(measures, base)
    } else if (type === "linemap") {
      spec = buildLinemapQuerySpec(measures, base)
    } else if (type === "choropleth") {
      spec = buildChoroplethQuerySpec(measures, base)
    }

    if (deepEquals(spec, prev[layerIndex])) {
      return prev[layerIndex]
    }

    return spec
  })
}

function buildPointmapQuerySpec(
  measures: Measure[],
  base: BaseDeckGLLayerQuerySpec
): DeckGLPointmapLayerQuerySpec | null {
  const lonMeasure = measures.find(({ name }) => name === "lon")
  const latMeasure = measures.find(({ name }) => name === "lat")
  const altMeasure = measures.find(({ name }) => name === "alt")
  if (base.table && lonMeasure && latMeasure) {
    return {
      type: "pointmap",
      ...base,
      lonMeasure,
      latMeasure,
      altMeasure
    }
  }
  return null
}

function buildLinemapQuerySpec(
  measures: Measure[],
  base: BaseDeckGLLayerQuerySpec
): DeckGLLinemapLayerQuerySpec | null {
  const geoMeasure = measures.find(({ name }) => name === "geo")
  if (base.table && geoMeasure) {
    return {
      type: "linemap",
      ...base,
      geoMeasure
    }
  }
  return null
}

function buildChoroplethQuerySpec(
  measures: Measure[],
  base: BaseDeckGLLayerQuerySpec
): DeckGLChoroplethLayerQuerySpec | null {
  const geoMeasure = measures.find(({ name }) => name === "geo")
  const elevationMeasure = measures.find(({ name }) => name === "elevation")
  if (base.table && geoMeasure) {
    return {
      type: "choropleth",
      ...base,
      geoMeasure,
      elevationMeasure
    }
  }
  return null
}
