// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { Dimension, Measure } from "constants/prop-types"
import NumberFormatting from "./number-formatting"
import DateFormatting from "./date-formatting"

interface Props {
  dimensions?: Dimension[]
  measures?: Measure[]
  multiSource?: boolean
  allowMeasureDateFormatting?: boolean
  onMeasureFormat: (value: string, index: number) => void
  onDimensionFormat: (value: string, index: number) => void
}

const defaultArray = []
const ChartFormatting = ({
  dimensions = defaultArray,
  measures = defaultArray,
  multiSource,
  onMeasureFormat,
  onDimensionFormat,
  allowMeasureDateFormatting = false
}: Props) => {
  const hasDimensions = dimensions.filter((d) => d.value).length > 0
  const hasMeasures = measures.filter((d) => d.value).length > 0

  return (
    <div className="chart-editor-section">
      {(hasDimensions || hasMeasures) && (
        <div className="chart-editor-label">Formatting</div>
      )}

      <NumberFormatting measures={measures} onNumberFormat={onMeasureFormat} />
      {allowMeasureDateFormatting && (
        <DateFormatting
          selectors={measures}
          onDateFormat={onMeasureFormat}
          formatType="date"
        />
      )}
      <DateFormatting
        onDateFormat={onDimensionFormat}
        multiSource={multiSource}
        selectors={dimensions}
      />
    </div>
  )
}

export default ChartFormatting
