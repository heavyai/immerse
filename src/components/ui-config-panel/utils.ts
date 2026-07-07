// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  UI_CONFIG_TEXT_CONSTANTS,
  UI_CONFIG_CHART_CONSTANTS,
  getStyleRule
} from "components/ui-config-panel/constants"

import {
  UserConfig,
  TextElement,
  TextConfigTypes
} from "components/ui-config-panel/types"

// Creates stylesheet for font size / weight settings
export const fontSizeWeightOverrides = (styles: UserConfig): string => {
  if (styles && styles.text) {
    const textStyles = Object.keys(styles.text) as TextElement[]
    const styleBlocks = textStyles
      // Only attempt to create styles for elements we have settings for
      .filter((elementKey: TextElement) => UI_CONFIG_TEXT_CONSTANTS[elementKey])
      .map((elementKey: TextElement) => {
        const styleForSelector = styles.text[elementKey]
        const selectors = UI_CONFIG_TEXT_CONSTANTS[elementKey].selectors.join(
          ", "
        )
        const rules = (Object.keys(styleForSelector) as TextConfigTypes[])
          .map((property) => getStyleRule(property, styleForSelector[property]))
          .join(" ")
        return `${selectors} { ${rules} }`
      })

    return styleBlocks.join(" ")
  }
  return ""
}

// Creates stylesheet for label settings
export const labelOverrides = (styles: UserConfig): string =>
  styles?.label?.axisTruncationLength
    ? `${UI_CONFIG_CHART_CONSTANTS.axisTruncationLength.selectors.join(
        ", "
      )} { max-width: ${styles.label.axisTruncationLength}px !important; }`
    : ""

// Creates stylesheet for label settings
export const legendOverrides = (styles: UserConfig): string =>
  styles?.chart?.maxLegendWidth
    ? `${UI_CONFIG_CHART_CONSTANTS.maxLegendWidth.selectors.join(
        ", "
      )} { max-width: ${styles.chart.maxLegendWidth}px !important; }`
    : ""

export const toggleHighContrastColorClasses = (enabled: boolean) => {
  if (enabled) {
    document.body.classList.add("high-contrast")
  } else {
    document.body.classList.remove("high-contrast")
  }
}

export const chartMarginOverrides = (styles: UserConfig): string => {
  return styles?.chart?.dashboardGridMargin
    ? `
    .react-grid-layout.dashboard:not(.chart-edit-mode) .react-grid-item {
      padding: ${styles.chart.dashboardGridMargin / 2}px;
    }
    .react-grid-layout.dashboard:not(.chart-edit-mode) .react-grid-item.react-grid-placeholder {
      padding: ${styles.chart.dashboardGridMargin / 2}px;
      background-clip: content-box;
    }
    .react-grid-layout.dashboard:not(.chart-edit-mode) .react-resizable-handle {
      bottom: ${styles.chart.dashboardGridMargin / 2}px !important;
      right: ${styles.chart.dashboardGridMargin / 2}px !important;
    }
    .react-grid-layout.dashboard.chart-edit-mode .react-grid-item {
      padding: 12px;
    }
  `
    : ""
}
