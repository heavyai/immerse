// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FontWeight, UserConfig, TextConfigTypes, TextElement } from "./types"
import {
  getColors,
  CUSTOM_COLORS,
  SOLID_COLORS,
  ORDINAL_COLORS,
  QUANTITATIVE_COLORS
} from "services/colors"

export const DEFAULT_DB_CONFIG_USER_ROLE = "immerse_db_config"

// TODO: Use `:export` to share variables between our SCSS and JS, and do some
// variable cleanup while we're at it
//
// These are passed to our Vega charts via a vegaConfig (non-Vega charts have
// their colors set in CSS all across heavyai-charting and heavyai-d3)
export const DEFAULT_LIGHT_MODE_AXIS_COLOR = "#868686" // $text-gray
export const DEFAULT_DARK_MODE_AXIS_COLOR = "#aaaaaa" // $dimTextOnDark

export const DEFAULT_GRID_AXIS_COLOR = "#e2e2e2"
export const DEFAULT_DARK_MODE_GRID_AXIS_COLOR = "#333333"

export const UI_CONFIG_CHART_TITLE = "chartTitle"
export const UI_CONFIG_AXIS_TITLE = "axisTitle"
export const UI_CONFIG_AXIS_TICK_LABEL = "axisTickLabel"
export const UI_CONFIG_TOOLTIPS = "toolTips"
export const UI_CONFIG_LEGEND_DISCRETE = "legendDiscrete"
export const UI_CONFIG_LEGEND_CONTINUOUS = "legendContinuous"
export const UI_CONFIG_BINNING_CONTROLS = "binningControls"
export const UI_CONFIG_COLOR_PALETTE = "colorPalette"
export const UI_CONFIG_ANNOTATION_LABEL = "annotationLabel"
export const UI_CONFIG_TABLE_TEXT = "tableText"

export const STYLE_PROPERTY_FONT_SIZE = "fontSize"
export const STYLE_PROPERTY_FONT_WEIGHT = "fontWeight"

export const STYLE_VALUE_FONT_WEIGHT_NORMAL = "normal"
export const STYLE_VALUE_FONT_WEIGHT_BOLD = "bold"

export const FONT_INCREMENT_VALUE = 2
export const FONT_SIZE_MIN = 6
export const FONT_SIZE_MAX = 42

// We use the `selectors` configured here to build override style blocks for the
// UI Config feature.
//
// Where possible (i.e. when we have control over how the elements are generated)
// we target these elements using a special data attr `data-ui-config-id` so that
// developers don't accidentally change the selector when restyling or refactoring
// elements (similar to `data-testid` for automation).
export const UI_CONFIG_TEXT_CONSTANTS = {
  [UI_CONFIG_CHART_TITLE]: {
    label: "Chart title",
    selectors: ["[data-ui-config-id=chart-title]"]
  },
  [UI_CONFIG_AXIS_TITLE]: {
    label: "Axis title",
    selectors: [
      // immerse
      "[data-ui-config-id=axis-title]",
      ".mark-text.role-axis-title > text", // Vega-generated SVG

      // heavyai-d3 and heavyai-charting
      ".d3-combo-chart .label-group .axis-label",
      ".dc-chart .table-sort", // Table chart column headers
      ".dc-chart div.axis-label-edit" // Heatmap
    ]
  },
  [UI_CONFIG_AXIS_TICK_LABEL]: {
    label: "Axis tick label",
    selectors: [
      // immerse
      "[data-ui-config-id=axis-tick-label]",
      ".mark-text.role-axis-label > text", // Vega-generated SVG

      // heavyai-d3 and heavyai-charting
      ".d3-combo-chart .domain-input-group .domain-input",
      ".axis-lock .axis-input",
      ".axis-lock .axis-input input",
      ".heatmap-scroll .docked-y-axis .text",
      ".heatmap-scroll .docked-x-axis .text",
      ".dc-chart .axis text",
      ".axis .tick >text" // Old Combo, Stacked Bar
    ]
  },
  [UI_CONFIG_TOOLTIPS]: {
    label: "Tooltips",
    selectors: [
      // immerse
      "[data-ui-config-id=chart-tooltip]",
      "[data-ui-config-id=chart-tooltip] h5", // Old Combo

      // heavyai-d3 and heavyai-charting
      ".dc-chart .chart-popup-box",
      ".chart-popup-box .popup-value", // Pie charts
      ".dc-chart .map-popup-box-new .map-popup-item",
      ".ellipse-text", // Scatter, pointmap, linemap, choropleth
      // Note: I couldn't get relative font sizes working for the heavyai-d3 tooltips
      // so all text in those tooltips will get the same size
      ".d3-combo-chart .tooltip-group div" // Stacked bar
    ]
  },
  [UI_CONFIG_LEGEND_DISCRETE]: {
    label: "Legend (discrete)",
    selectors: [
      // immerse
      "[data-ui-config-id=legend-discrete]",

      // heavyai-d3 and heavyai-charting
      ".dc-legend", // Histogram (styled in heavyai-charting)
      ".dc-chart .legend.nominal-legend", // Scatter (styled in heavyai-d3)
      // Note: I couldn't get relative font sizes working for the heavyai-d3 legend
      // so all text in those legends will get the same size
      ".d3-combo-chart .legend-group div", // Stacked bar
      // Targeting a couple of headers specifically because they have
      // font-weight: normal styles on them that need to be overridden for the
      // bold style to apply
      ".chart-legend:not(.floating) .title", // Old combo
      ".dc-chart .legend.nominal-legend .header" // Scatter
    ]
  },
  [UI_CONFIG_LEGEND_CONTINUOUS]: {
    label: "Legend (continuous)",
    selectors: [
      // immerse
      "[data-ui-config-id=legend-continuous]",

      // heavyai-d3 and heavyai-charting
      ".dc-chart .legend-cont .legend-label",
      ".dc-chart .legend .range .text",
      ".dc-chart .legend.gradient-legend .header"
    ]
  },
  [UI_CONFIG_BINNING_CONTROLS]: {
    label: "Top section controls",
    selectors: [
      // immerse
      "[data-ui-config-id=top-controls]",
      "[data-ui-config-id=top-controls] input",

      // heavyai-d3 and heavyai-charting
      ".d3-combo-chart .binning-group .bin-label",
      ".d3-combo-chart .binning-group .item",
      ".d3-combo-chart .brush-range-input-group .brush-range-input",
      ".dc-chart .range-display", // Histogram
      ".dc-chart .bin-row"
    ]
  },
  [UI_CONFIG_ANNOTATION_LABEL]: {
    label: "Annotation labels",
    selectors: ["[data-ui-config-id=annotation-label]"]
  },
  [UI_CONFIG_TABLE_TEXT]: {
    label: "Table chart font",
    selectors: [".table-row > td"]
  }
}

export const UI_CONFIG_CHART_CONSTANTS = {
  axisTruncationLength: {
    selectors: [".heatmap-scroll .text"]
  },
  maxLegendWidth: {
    selectors: [
      ".layers-legend-container:not(.pinned) .collapsible-layers-legend-panel",
      ".chart-legend",
      ".nominal-legend",
      ".gradient-legend",
      ".dc-legend",
      // For stacked bar legends, which shares code with continuous legends
      // (which we don't want to target, thus the :not)
      ":not(.legend-cont) > .legend-group"
    ]
  }
}

const solidColorsPalette: Record<string, string[]> = getColors(SOLID_COLORS)
const solidColors: string[] = Object.values(solidColorsPalette).flat()

const customColorsPalette: Record<string, string[]> = getColors(CUSTOM_COLORS)
const customColors: string[] = Object.values(customColorsPalette).flat()

const ordinalColorsPalette: Record<string, string[]> = getColors(ORDINAL_COLORS)
const ordinalColors: string[][] = Object.values(ordinalColorsPalette)

const quantitativeColorsPalette: Record<string, string[]> = getColors(
  QUANTITATIVE_COLORS
)
const quantitativeColors: string[][] = Object.values(quantitativeColorsPalette)

export const DEFAULT_DATABASE_STYLES: UserConfig = {
  version: 1,
  text: {
    [UI_CONFIG_CHART_TITLE]: {
      [STYLE_PROPERTY_FONT_SIZE]: 16
    },
    [UI_CONFIG_AXIS_TITLE]: {
      [STYLE_PROPERTY_FONT_SIZE]: 13
    },
    [UI_CONFIG_AXIS_TICK_LABEL]: {
      [STYLE_PROPERTY_FONT_SIZE]: 10
    },
    [UI_CONFIG_TOOLTIPS]: {
      [STYLE_PROPERTY_FONT_SIZE]: 13
    },
    [UI_CONFIG_LEGEND_DISCRETE]: {
      [STYLE_PROPERTY_FONT_SIZE]: 12
    },
    [UI_CONFIG_LEGEND_CONTINUOUS]: {
      [STYLE_PROPERTY_FONT_SIZE]: 10
    },
    [UI_CONFIG_BINNING_CONTROLS]: {
      [STYLE_PROPERTY_FONT_SIZE]: 12
    },
    [UI_CONFIG_ANNOTATION_LABEL]: {
      [STYLE_PROPERTY_FONT_SIZE]: 16,
      [STYLE_PROPERTY_FONT_WEIGHT]: 400
    },
    [UI_CONFIG_TABLE_TEXT]: {
      [STYLE_PROPERTY_FONT_SIZE]: 13
    }
  },
  // In future versions we could move this to the `chart` settings section
  label: {
    axisTruncationLength: 100
  },
  colorPalettes: {
    solid: solidColors,
    custom: customColors,
    ordinal: ordinalColors,
    quantitative: quantitativeColors
  },
  highContrastFontColors: false,
  chart: {
    // matches default value in featureflag-definitions.json
    dashboardGridMargin: 24,
    maxLegendWidth: 160
  }
}

export const databaseTextStyleKeys: TextElement[] = Object.keys(
  DEFAULT_DATABASE_STYLES.text
)

export const formatStyleValue = {
  [STYLE_PROPERTY_FONT_SIZE]: (value: number): string => `${value}px`,
  [STYLE_PROPERTY_FONT_WEIGHT]: (value: FontWeight): string => `${value}`
}

const getStyleProperty = {
  [STYLE_PROPERTY_FONT_SIZE]: "font-size",
  [STYLE_PROPERTY_FONT_WEIGHT]: "font-weight"
}

export const getStyleRule = (styleKey: TextConfigTypes, value: any) =>
  `${getStyleProperty[styleKey]}: ${formatStyleValue[styleKey](
    value
  )} !important;`

export const MAX_NUM_CONTINUOUS_SWATCHES = 10
export const MAX_NUM_CATEGORICAL_SWATCHES = 64
export const MAX_DASHBOARD_GRID_MARGIN = 50
export const MAX_AXIS_TRUNCATION_VALUE = 200
export const MIN_LEGEND_WIDTH_VALUE = 100
export const MAX_LEGEND_WIDTH_VALUE = 1000
