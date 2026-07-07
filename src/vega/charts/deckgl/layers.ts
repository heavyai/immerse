// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { COORDINATE_SYSTEM } from "@deck.gl/core"
import {
  Layer,
  ScatterplotLayer,
  PointCloudLayer,
  PathLayer,
  SolidPolygonLayer
} from "deck.gl"
import type { PointCloudLayerProps } from "@deck.gl/layers/point-cloud-layer/point-cloud-layer"
import { scaleQuantize } from "d3-scale"

import {
  DeckGLLayerVisualSpec,
  DeckGLPointmapLayerVisualSpec,
  DeckGLLinemapLayerVisualSpec,
  DeckGLGeoheatLayerVisualSpec,
  DeckGLChoroplethLayerVisualSpec
} from "./visual-spec"

const DEFAULT_COLOR: [number, number, number] = [17, 95, 154]

export interface PopupInfo {
  x: number
  y: number
  data: Record<"label" | "value", string>[]
}

export type PopupSetter = (info: any) => void

/** @returns true if v is not undefined and not null */
export function isDefined<T>(v: T | undefined | null): v is T {
  return v !== undefined && v !== null
}

/**
 * Checks if a property exists on the elements in the array.
 * @param data The array to check
 * @param prop The property to check
 * @returns true if the prop exists
 */
export function hasProperty<
  T,
  K extends keyof T,
  T2 extends T & Required<Pick<T, K>>
>(data: T[], prop: K): data is T2[] {
  return data.length > 0 && data[0][prop] !== undefined
}

/**
 * @param data Array of data
 * @param prop Property to calculate the min/max of
 * @returns the min/max of the given property in the array of data
 */
export function getMinMax<
  T extends Record<K, number>,
  K extends { [P in keyof T]: T[P] extends number ? P : never }[keyof T]
>(data: T[], prop: K): [number, number] {
  const minMax: [number, number] = [Infinity, -Infinity]
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i][prop]
    if (typeof v === "number") {
      if (v < minMax[0]) {
        minMax[0] = v
      }
      if (v > minMax[1]) {
        minMax[1] = v
      }
    }
  }
  return minMax
}

export type DataWithColor = {
  color?: number
}

/**
 * We're keeping the palette and minmax on the value that we pass into the
 * getColor/getFillColor properties on layers so that we'll have access to them
 * on subsequent updates.
 */
export type DeckGLGetColor = PointCloudLayerProps<DataWithColor>["getColor"] & {
  palette: Array<[number, number, number]>
  minmax: [number, number] | null
}

/**
 * @param spec Base Visual Spec
 * @param existing An existing getColor value
 * @returns a value or function that can be used for the getColor or similar
 * property on a deckgl layer.
 */
export function buildGetColor(
  palette: Array<[number, number, number]>,
  minmax: [number, number] | null
): DeckGLGetColor {
  if (minmax && palette.length > 1) {
    const scale = scaleQuantize().domain(minmax).range(palette)
    const getColor: DeckGLGetColor = (d) => scale(d.color)
    getColor.palette = palette
    getColor.minmax = minmax
    return getColor
  }

  const getColor: DeckGLGetColor = palette[0]
  getColor.palette = palette
  getColor.minmax = minmax
  return getColor
}

const DEFAULT_GET_COLOR = buildGetColor([DEFAULT_COLOR], null)

/**
 * @param spec Base visual spec
 * @param existing An existing getColor value, if it exists
 * @returns a new getColor value
 */
export function updateGetColorFromSpec(
  spec: DeckGLLayerVisualSpec,
  existing: DeckGLGetColor | null
): DeckGLGetColor {
  return buildGetColor(spec.palette, existing?.minmax)
}

/**
 * @param data Array of data
 * @param existing An existing getColor value, if it exists
 * @returns a new getColor value
 */
export function updateGetColorMinMax(
  data: DataWithColor[],
  existing: DeckGLGetColor | null
): DeckGLGetColor {
  const palette = existing?.palette || [DEFAULT_COLOR]
  if (hasProperty(data, "color")) {
    const colorDomainMinMax = getMinMax(data, "color")

    if (isFinite(colorDomainMinMax[0]) && isFinite(colorDomainMinMax[1])) {
      return buildGetColor(palette, colorDomainMinMax)
    }
  }
  return buildGetColor(palette, null)
}

// the deckgl typings are missing this
type ObjectInfo<T> = {
  index: number
  data: T[]
  target: number[]
}

/** data for a pointmap chart */
export type PointData = DataWithColor & {
  lon: number
  lat: number
  alt?: number
}

/**
 * @param hasAlt Whether or not altitude is defined
 * @returns a default, empty point layer
 */
export function buildPointLayerWithDefaults(hasAlt: boolean): Layer<any> {
  if (hasAlt) {
    return new PointCloudLayer<any>({
      data: [],
      getPosition: (d: PointData, { target }: ObjectInfo<PointData>) => {
        target[0] = d.lon
        target[1] = d.lat
        target[2] = d.alt as number
        return target
      },
      getColor: DEFAULT_GET_COLOR,
      pointSize: 3,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    })
  } else {
    return new ScatterplotLayer<any>({
      data: [],
      getPosition: (d: PointData, { target }: ObjectInfo<PointData>) => {
        target[0] = d.lon
        target[1] = d.lat
        return target
      },
      getFillColor: DEFAULT_GET_COLOR,
      getRadius: 3,
      radiusUnits: "pixels",
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    })
  }
}

/**
 * Builds a point layer with the given visual settings
 * @param id Layer id
 * @param spec Visual spec for the layer
 * @param existing The existing layer, if any
 * @returns a pointmap layer
 */
export function buildPointLayer(
  id: string,
  spec: DeckGLPointmapLayerVisualSpec,
  onHover: PopupSetter,
  existing?: Layer<any>
): Layer<any> {
  let getColor = existing
    ? existing instanceof PointCloudLayer
      ? existing.props.getColor
      : existing.props.getFillColor
    : null
  getColor = updateGetColorFromSpec(spec, getColor)
  if (spec.hasAlt) {
    if (!(existing instanceof PointCloudLayer)) {
      existing = buildPointLayerWithDefaults(true)
    }
    return existing.clone({
      id: `${id}_pointcloud`,
      opacity: spec.opacity,
      pickable: Boolean(spec.popupColumns?.length),
      pointSize: spec.pointSize,
      onHover,
      getColor,
      updateTriggers: {
        getColor: [getColor.palette, getColor.minmax]
      }
    })
  } else {
    if (!(existing instanceof ScatterplotLayer)) {
      existing = buildPointLayerWithDefaults(false)
    }
    return existing.clone({
      id: `${id}_scatterplot`,
      opacity: spec.opacity,
      pickable: Boolean(spec.popupColumns?.length),
      getRadius: spec.pointSize,
      onHover,
      getFillColor: getColor,
      updateTriggers: {
        getFillColor: [getColor.palette, getColor.minmax],
        getRadius: [spec.pointSize]
      }
    })
  }
}

/**
 * Updates a point layer with new data
 * @param id Layer id
 * @param data New layer data
 * @param existing The existing layer, if any
 * @returns a point layer
 */
export function updatePointLayerData(
  id: string,
  data: PointData[],
  existing?: Layer<any>
): Layer<any> {
  let getColor = existing
    ? existing instanceof PointCloudLayer
      ? existing.props.getColor
      : existing.props.getFillColor
    : null
  getColor = updateGetColorMinMax(data, getColor)
  if (hasProperty(data, "alt")) {
    if (!(existing instanceof PointCloudLayer)) {
      existing = buildPointLayerWithDefaults(true)
    }
    return existing.clone({
      id: `${id}_pointcloud`,
      data,
      getColor,
      updateTriggers: {
        getColor: [getColor.palette, getColor.minmax]
      }
    })
  } else {
    if (!(existing instanceof ScatterplotLayer)) {
      existing = buildPointLayerWithDefaults(false)
    }
    return existing.clone({
      id: `${id}_scatterplot`,
      data,
      getFillColor: getColor,
      updateTriggers: {
        getFillColor: [getColor.palette, getColor.minmax]
      }
    })
  }
}

export type LineData = DataWithColor & {
  geo: string
}

export type ProcessedLineData = DataWithColor & {
  geo: number[][]
}

export function linestringToArray(str: string): number[][] {
  const m = str.match(/^\s*linestring\s*\((.*)\)\s*$/i)
  if (m) {
    // m[1] will be "x y,x y,..."
    // split on commas, then split on spaces
    return m[1].split(",").map((s) => s.split(/\s+/).map(Number))
  }
  return []
}

/**
 * @returns a default, empty line layer
 */
export function buildLineLayerWithDefaults(): Layer<any> {
  return new PathLayer<ProcessedLineData>({
    data: [],
    getPath: (d: ProcessedLineData) => d.geo,
    getWidth: 3,
    widthUnits: "pixels",
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    getColor: DEFAULT_GET_COLOR
  })
}

/**
 * Build a line layer with the given visual settings
 * @param id Layer id
 * @param spec Visual spec for the layer
 * @param existing The existing layer, if any
 * @returns a line layer
 */
export function buildLineLayer(
  id: string,
  spec: DeckGLLinemapLayerVisualSpec,
  onHover: PopupSetter,
  existing?: Layer<any>
): Layer<any> {
  let getColor =
    existing && existing instanceof PathLayer ? existing.props.getColor : null
  getColor = updateGetColorFromSpec(spec, getColor)
  if (!(existing instanceof PathLayer)) {
    existing = buildLineLayerWithDefaults()
  }
  return existing.clone({
    id: `${id}_path`,
    opacity: spec.opacity,
    pickable: Boolean(spec.popupColumns?.length),
    onHover,
    getColor,
    getWidth: spec.strokeWidth,
    updateTriggers: {
      getColor: [getColor.palette, getColor.minmax],
      getWidth: [spec.strokeWidth]
    }
  })
}

/**
 * Updates a line layer with new data
 * @param id Layer id
 * @param data New layer data
 * @param existing The existing layer, if any
 * @returns a line layer
 */
export function updateLineLayerData(
  id: string,
  data: LineData[],
  existing?: Layer<any>
): Layer<any> {
  let getColor =
    existing && existing instanceof PathLayer ? existing.props.getColor : null
  getColor = updateGetColorMinMax(data, getColor)

  const processedData = data.map((d) => ({
    ...d,
    geo: linestringToArray(d.geo)
  }))
  if (!(existing instanceof PathLayer)) {
    existing = buildLineLayerWithDefaults()
  }
  return existing.clone({
    id: `${id}_path`,
    data: processedData,
    getColor,
    updateTriggers: {
      getColor: [getColor.palette, getColor.minmax]
    }
  })
}

export type GeoheatData = DataWithColor & {
  lon: number
  lat: number
}

/**
 * @returns a default, empty geoheat layer
 */
export function buildGeoheatLayerWithDefaults(): Layer<any> {
  // TODO
  return new ScatterplotLayer<GeoheatData>({
    data: [],
    getPosition: (d: GeoheatData, { target }: ObjectInfo<GeoheatData>) => {
      target[0] = d.lon
      target[1] = d.lat
      return target
    },
    getRadius: 3,
    radiusUnits: "pixels",
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    getFillColor: DEFAULT_GET_COLOR
  })
}

/**
 * Build a geoheat layer with the given visual settings
 * @param id Layer id
 * @param spec Visual spec for the layer
 * @param existing The existing layer, if any
 * @returns a geoheat layer
 */
export function buildGeoheatLayer(
  id: string,
  spec: DeckGLGeoheatLayerVisualSpec,
  onHover: PopupSetter,
  existing?: Layer<any>
): Layer<any> {
  // TODO
  let getFillColor =
    existing && existing instanceof ScatterplotLayer
      ? existing.props.getFillColor
      : null
  getFillColor = updateGetColorFromSpec(spec, getFillColor)
  if (!(existing instanceof ScatterplotLayer)) {
    existing = buildGeoheatLayerWithDefaults()
  }
  return existing.clone({
    id: `${id}_scatterplot`,
    opacity: spec.opacity,
    pickable: Boolean(spec.popupColumns?.length),
    onHover,
    getFillColor,
    updateTriggers: {
      getFillColor: [getFillColor.palette, getFillColor.minmax]
    }
  })
}

/**
 * Updates a geoheat layer with new data
 * @param id Layer id
 * @param data New layer data
 * @param existing The existing layer, if any
 * @returns a geoheat layer
 */
export function updateGeoheatLayerData(
  id: string,
  data: GeoheatData[],
  existing?: Layer<any>
): Layer<any> {
  // TODO
  let getFillColor =
    existing && existing instanceof ScatterplotLayer
      ? existing.props.getFillColor
      : null
  getFillColor = updateGetColorMinMax(data, getFillColor)
  if (!(existing instanceof ScatterplotLayer)) {
    existing = buildGeoheatLayerWithDefaults()
  }
  return existing.clone({
    id: `${id}_scatterplot`,
    data,
    getFillColor,
    updateTriggers: {
      getFillColor: [getFillColor.palette, getFillColor.minmax]
    }
  })
}

export type ChoroplethData = DataWithColor & {
  geo: string
  elevation?: number
}

export type ProcessedChoroplethData = DataWithColor & {
  geo: number[][][]
  elevation?: number
}

function getChoroplethElevation(d: ProcessedChoroplethData): number {
  return d.elevation !== undefined ? d.elevation : 0
}

function processPolygonString(str: string): number[][][] {
  // foreach parentheses, split on commas, then split on spaces
  return [...str.matchAll(/\(([^)]+)\)/g)].map(([_, s]) =>
    s.split(",").map((s2) => s2.split(/\s+/).map(Number))
  )
}

export function processChoroplethData(
  d: ChoroplethData
): ProcessedChoroplethData[] {
  let m = d.geo.match(/^\s*polygon\s*\((.*)\)\s*$/i)
  if (m) {
    // m[1] will be "(x y,x y,...),(...),..."
    // since data only has one polygon, return one data object
    return [
      {
        ...d,
        geo: processPolygonString(m[1])
      }
    ]
  }

  m = d.geo.match(/^\s*multipolygon\s*\((.*)\)\s*$/i)
  if (m) {
    // m[1] will be "((x y,x y,...),...),((x y, ...),...)"
    // multiploygons can have, well, multiple polygons, so, we'll need to
    // return multiple data objects
    // foreach "((...))", treat the inner "(...)" as a singular polygon string
    // and process it
    return [...m[1].matchAll(/\(\s*(\([^)]+\))\s*\)/g)].map(([_, s]) => ({
      ...d,
      geo: processPolygonString(s)
    }))
  }

  return []
}

/**
 * @param hasElevation Whether or not elevation is defined
 * @returns a default, empty choropleth layer
 */
export function buildChoroplethLayerWithDefaults(
  hasElevation: boolean
): Layer<any> {
  return new SolidPolygonLayer<ProcessedChoroplethData>({
    data: [],
    getPolygon: (d: ProcessedChoroplethData) => d.geo,
    extruded: hasElevation,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    getFillColor: DEFAULT_GET_COLOR,
    getElevation: hasElevation ? getChoroplethElevation : null
  })
}

/**
 * Builds a choropleth layer with the given visual settings
 */
export function buildChoroplethLayer(
  id: string,
  spec: DeckGLChoroplethLayerVisualSpec,
  onHover: PopupSetter,
  existing?: Layer<any>
): Layer<any> {
  let getFillColor =
    existing && existing instanceof SolidPolygonLayer
      ? existing.props.getFillColor
      : null

  getFillColor = updateGetColorFromSpec(spec, getFillColor)
  if (!(existing instanceof SolidPolygonLayer)) {
    existing = buildChoroplethLayerWithDefaults(spec.hasElevation)
  }
  return existing.clone({
    id: `${id}_solidpolygon`,
    opacity: spec.opacity,
    pickable: Boolean(spec.popupColumns?.length),
    extruded: spec.hasElevation,
    onHover,
    getFillColor,
    getElevation: spec.hasElevation ? getChoroplethElevation : null,
    updateTriggers: {
      getFillColor: [getFillColor.palette, getFillColor.minmax]
    }
  })
}

/**
 * Updates a choropleth layer with new data
 * @param id Layer id
 * @param data New layer data
 * @param existing The existing layer, if any
 * @returns a choropleth layer
 */
export function updateChoroplethLayerData(
  id: string,
  data: ChoroplethData[],
  existing?: Layer<any>
): Layer<any> {
  let getFillColor =
    existing && existing instanceof SolidPolygonLayer
      ? existing.props.getFillColor
      : null
  getFillColor = updateGetColorMinMax(data, getFillColor)
  const processedData = data.flatMap(processChoroplethData)
  const hasElevation = hasProperty(data, "elevation")
  if (!(existing instanceof SolidPolygonLayer)) {
    existing = buildChoroplethLayerWithDefaults(hasElevation)
  }
  return existing.clone({
    id: `${id}_solidpolygon`,
    data: processedData,
    getFillColor,
    extruded: true,
    getElevation: hasElevation ? getChoroplethElevation : null,
    updateTriggers: {
      getFillColor: [getFillColor.palette, getFillColor.minmax]
    }
  })
}

/**
 * Build a layer
 * @param id Layer id
 * @param spec Visual settings
 * @param existing An existing layer, if any
 * @returns a layer
 */
export function buildLayer(
  id: string,
  spec: DeckGLLayerVisualSpec,
  popupSetter: PopupSetter,
  existing?: Layer<any>
): Layer<any> {
  if (spec.type === "pointmap") {
    return buildPointLayer(id, spec, popupSetter, existing)
  } else if (spec.type === "linemap") {
    return buildLineLayer(id, spec, popupSetter, existing)
  } else if (spec.type === "geoheat") {
    return buildGeoheatLayer(id, spec, popupSetter, existing)
  } else if (spec.type === "choropleth") {
    return buildChoroplethLayer(id, spec, popupSetter, existing)
  }
  return existing
}

/**
 * Update the layer data
 * @param id Layer id
 * @param data Layer data
 * @param existing An existing layer, if any
 * @returns a layer
 */
export function updateLayerData(
  id: string,
  type: DeckGLLayerVisualSpec["type"],
  data: any,
  existing?: Layer<any>
): Layer<any> {
  if (type === "pointmap") {
    return updatePointLayerData(id, data, existing)
  } else if (type === "linemap") {
    return updateLineLayerData(id, data, existing)
  } else if (type === "geoheat") {
    return updateGeoheatLayerData(id, data, existing)
  } else if (type === "choropleth") {
    return updateChoroplethLayerData(id, data, existing)
  }
  return existing
}
