// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartField, ChartTypes } from "components/sql-notebook/types"

/**
 * PointMap Settings
 */
type MapChartType =
  | ChartTypes.POINT_MAP
  | ChartTypes.LINE_MAP
  | ChartTypes.POLYGON_MAP

type MapSettingsBase = {
  query: string
  type: MapChartType
}

export type PointMapSettings = MapSettingsBase & {
  latField: ChartField
  lonField: ChartField
  colorField: ChartField
  sizeField: ChartField
  settings: {
    pointSize: ChartField | number
    dotDensity: boolean
    renderLimit: number
  }
}

export type PolygonMapSettings = MapSettingsBase & {
  geomField: ChartField
  colorField: ChartField
  settings: {
    border: boolean
    renderLimit: number
  }
}

export type LineMapSettings = MapSettingsBase & {
  geomField: ChartField
  colorField: ChartField
  sizeField: ChartField
  settings: {
    strokeWidth: number
    renderLimit: number
  }
}

export type MapSettings =
  | PointMapSettings
  | PolygonMapSettings
  | LineMapSettings

/**
 * Popups
 */
export type PopupState = {
  data: any
  coords: {
    x: number
    y: number
  }
}

export type PopupResult = {
  // These are rows from the DB
  row_set: Array<object>
}
export type PopupResults = Array<PopupResult>

/**
 * Heavy Vega Spec
 */
// TODO
