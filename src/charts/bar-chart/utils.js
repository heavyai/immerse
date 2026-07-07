// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SHORT_BOTTOM_MARGIN,
  LABEL_SPACING,
  MIN_MARK_WIDTH,
  BAR_SPACING_PERCENT
} from "./bar-constants"

export function getLabel(d) {
  const nameTokens = []

  // okay, here's how this is gonna work. The user specified label is axisLabel
  // and if that's available, then use it as is.

  if (d.axisLabel) {
    return d.axisLabel
  } else {
    // otherwise, we'll add on the aggregate type (avg, count, min, etc) +
    // either the default label (if provided by the system) or the value
    // unless it's custom (custom measures have their own user specified title)
    if (d.aggType && d.aggType !== "Custom") {
      nameTokens.push(d.aggType)
    }
    nameTokens.push(d.label || d.value)
    return nameTokens.join(" ")
  }
}

// helper fns for reducing multi-measure domains by axis
export function getLockedDomain(_measures) {
  const hasSetDomain = _measures.filter((d) => d.minMax).length
  const minMax = _measures.reduce(
    (accum, d) => {
      if (d.minMax) {
        return [
          Math.min(d.minMax[0], accum[0]),
          Math.max(d.minMax[1], accum[1])
        ]
      } else {
        return accum
      }
    },
    [Infinity, -Infinity]
  )
  return minMax && hasSetDomain ? minMax : "auto"
}

// This is a very rough formula. There are other ways to translate between
// characters and pixels but this is what we have been using up until now for
// non-Vega axis label calculations and it'll do.
export const getCharWidthForFontSize = (fontSize) => fontSize / 2

// Same comment as above
export const getMaxCharsForAxisLength = (axisLength, axisFontSize) =>
  // The awkward `- 1` is to account for the `...` that gets added to the end of
  // the labels. Without it, non-vega axis labels are always longer than vega ones
  axisLength / getCharWidthForFontSize(axisFontSize) - 1

// given a data array, margins, width, and number of groups
// determine if the chart's x axis tick labels should be rotated
// and how tall the chart's bottom margin should be
export function autoSetMarginBottom(
  _data,
  _margin,
  _width,
  _numberGroups,
  axisLength,
  axisFontSize
) {
  const spacingBetweenLabels =
    LABEL_SPACING * getCharWidthForFontSize(axisFontSize)
  const maxPermittedLabelLength = axisLength
  const chartWidth = _width - _margin.left - _margin.right
  const margin = { ..._margin }

  const minMarkPanelWidth = _data.length * MIN_MARK_WIDTH
  const markPanelWidth =
    chartWidth < minMarkPanelWidth ? minMarkPanelWidth : chartWidth

  const barSpacingPercent = BAR_SPACING_PERCENT / 100
  const barWidth =
    chartWidth / _numberGroups -
    (chartWidth / _numberGroups) * barSpacingPercent

  const handleNullKey = (key) => (key === null ? "null" : key)

  const maxLabelLength =
    _data.reduce((max, d) => {
      const key = handleNullKey(d.key0)
      const length = key ? key.length : 0
      return max > length ? max : length
    }, 0) *
      getCharWidthForFontSize(axisFontSize) +
    spacingBetweenLabels

  const totalLabelsWidth = _data.reduce((total, d, i) => {
    const key = handleNullKey(d.key0)
    let length = key ? key.length : 0
    length =
      length * getCharWidthForFontSize(axisFontSize) + spacingBetweenLabels
    if (length > maxPermittedLabelLength) {
      // labels shouldn't be longer then this because they are truncated to n chars
      // add another "spacingBetweenLabels" to account for the "..." added to truncated labels
      length =
        maxPermittedLabelLength +
        spacingBetweenLabels +
        spacingBetweenLabels / 2
    }
    if (i === 0 || i === _data.length - 1) {
      // account for additional spacing on left and right most labels
      length = length + spacingBetweenLabels
    }
    return total + length
  }, 0)

  const labelWiderThanBar = maxLabelLength > barWidth

  const labelsAreRotated =
    totalLabelsWidth >= markPanelWidth && labelWiderThanBar

  margin.bottom = labelsAreRotated
    ? Math.min(maxLabelLength, maxPermittedLabelLength) +
      // Sorry for the magic number 67. It was eyeballed across various charts to
      // see what number would prevent the labels from hitting the axis title text
      67
    : SHORT_BOTTOM_MARGIN

  return {
    margin,
    labelsAreRotated
  }
}
