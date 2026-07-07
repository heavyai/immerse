// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  UI_CONFIG_CHART_TITLE,
  UI_CONFIG_AXIS_TITLE,
  UI_CONFIG_AXIS_TICK_LABEL,
  UI_CONFIG_TOOLTIPS,
  UI_CONFIG_LEGEND_DISCRETE,
  UI_CONFIG_LEGEND_CONTINUOUS,
  UI_CONFIG_BINNING_CONTROLS,
  STYLE_PROPERTY_FONT_SIZE,
  STYLE_PROPERTY_FONT_WEIGHT
} from "./constants"

// The types of text elements that are configurable
export type TextElement =
  | typeof UI_CONFIG_CHART_TITLE
  | typeof UI_CONFIG_AXIS_TITLE
  | typeof UI_CONFIG_AXIS_TICK_LABEL
  | typeof UI_CONFIG_TOOLTIPS
  | typeof UI_CONFIG_LEGEND_DISCRETE
  | typeof UI_CONFIG_LEGEND_CONTINUOUS
  | typeof UI_CONFIG_BINNING_CONTROLS

// The names of configurable styles for each element type
export type TextConfigTypes =
  | typeof STYLE_PROPERTY_FONT_SIZE
  | typeof STYLE_PROPERTY_FONT_WEIGHT

// The names of configurable text styles and their types
export interface TextConfigStyles {
  [STYLE_PROPERTY_FONT_SIZE]: number
  [STYLE_PROPERTY_FONT_WEIGHT]?: FontWeight
}

// The names of configurable label settings and their types
export interface LabelConfig {
  axisTruncationLength: number
}

// Options for font weight settings
export type FontWeight = "bold" | "normal"

export type SimpleColorPalette = string[]
export type NestedColorPalette = SimpleColorPalette[]

export type EditableColorPalettes = "solid" | "custom"

export interface ChartConfig {
  dashboardGridMargin: number
  maxLegendWidth: number
}

/**
 * This is the shape of the object that's used to store user-configurable
 * settings like font sizes and color palettes. These settings are stored in
 * Redux in `store.userConfigurableUI` and is saved to the database
 */
export interface UserConfig {
  // This number should be iterated every time a major change is made to this
  // type
  version: number
  text: Record<TextElement, TextConfigStyles>
  label: LabelConfig
  colorPalettes: {
    // These correspond to the SOLID_COLORS and CUSTOM_COLORS color schemes in
    // colors.js, but try to match the servers.json schema
    solid: SimpleColorPalette
    custom: SimpleColorPalette
    quantitative: NestedColorPalette
    ordinal: NestedColorPalette
  }
  highContrastFontColors: boolean
  chart: ChartConfig
}

/**
 * A subset of UserConfig that doesn't include version number, and also allows
 * for properties of UserConfig to be blank. Used just for setting and getting
 * `store.userConfigurableUI.previewStyles`
 */
export type PreviewStyles = Partial<Omit<UserConfig, "version">>
