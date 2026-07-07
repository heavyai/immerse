// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Measure } from "constants/prop-types"

import React from "react"

import ChartNumberFormat from "components/chart-settings-format/chart-number-format"
import { pipe, uniqWith, filter, or, find } from "ramda"
import { ALL_NUMERICAL_TYPES } from "constants/data-types"

const measuresWithNumberFormat = pipe(
  uniqWith(
    (a: Measure, b) =>
      a.label === b.label && a.multiSourceIndex === b.multiSourceIndex
  ),
  filter(
    (measure: Measure) =>
      Boolean(measure.label) &&
      or(
        find((d) => measure.type === d, Object.keys(ALL_NUMERICAL_TYPES)),
        measure.aggType === "# Unique"
      )
  )
)
const defaultArray = []
interface NumberFormattingProps {
  measures: Measure[]
  onNumberFormat: (value: string, index: number) => void
}
const NumberFormatting = ({
  measures = defaultArray,
  onNumberFormat
}: NumberFormattingProps) => {
  const transformedMeasures = measuresWithNumberFormat(measures)

  const showFormattingSection = measures.length > 0
  return showFormattingSection ? (
    <div>
      <ChartNumberFormat
        measures={transformedMeasures}
        onValueChangeWithFormat={onNumberFormat}
      />
    </div>
  ) : null
}

export default NumberFormatting
