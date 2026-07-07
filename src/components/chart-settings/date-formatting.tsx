// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dimension, Measure } from "constants/prop-types"

import { pipe, filter, uniqWith, find } from "ramda"

import { TIME_UNITS } from "constants/data-types"

import ChartDateFormatter, {
  DateOption
} from "components/chart-settings-format/chart-date-format"
import React from "react"

import { process } from "utils/ImmerseSQLPlusPlus/parser"

interface DateFormattingProps {
  selectors: (Dimension | Measure)[]
  onDateFormat: (value: string, selectorIndex?: number) => void
  multiSource?: boolean
  formatType?: string
}
const defaultArray = []
const selectorsWithDateFormat = pipe(
  filter((selector) => !selector.extract),
  uniqWith(
    (a, b) => a.label === b.label && a.multiSourceIndex === b.multiSourceIndex
  ),
  filter(
    (selector) =>
      selector.label &&
      find((d) => selector.type === d, Object.keys(TIME_UNITS))
  )
)
interface IndexedDimension extends Dimension {
  index: number
  label: string
}
interface IndexedMeasure extends Measure {
  index: number
  label: string
}
type IndexedSelector = IndexedDimension | IndexedMeasure
export default class DateFormatting extends React.Component<
  DateFormattingProps,
  {}
> {
  renderMultisourceFormatting = (selectors: IndexedSelector[]) => (
    <ChartDateFormatter
      selector={selectors[0]}
      label={selectors
        .map((dim) => process(dim.label, { useDisplayName: true }))
        .join(", ")}
      onValueChange={this.onDateValueChange}
    />
  )

  renderFormatting = (selectors: IndexedSelector[]) =>
    selectors.map((selector, idx) => (
      <ChartDateFormatter
        selector={selector}
        key={idx}
        label={process(selector.label, { useDisplayName: true })}
        onValueChange={(option) =>
          this.onDateValueChange(option, selector.index)
        }
      />
    ))
  onDateValueChange = (option: DateOption, selectorIndex?) => {
    this.props.onDateFormat(
      option ? option.value : null,
      typeof selectorIndex === "undefined" ? null : selectorIndex,
      this.props.formatType === "date" ? "date" : null
    )
  }

  render() {
    const { selectors = defaultArray, multiSource } = this.props
    const transformedSelectors = selectorsWithDateFormat(selectors)
    if (transformedSelectors.length === 0) {
      return null
    }
    return (
      <div>
        <div className="chart-editor-label sub-section">Date Formatting</div>
        {multiSource
          ? this.renderMultisourceFormatting(transformedSelectors)
          : this.renderFormatting(transformedSelectors)}
      </div>
    )
  }
}
