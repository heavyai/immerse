// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FC, default as React } from "react"
import VegaChartFormatSelector from "./VegaChartFormatSelector"
import { isNumericType, isTimeType } from "constants/data-types"
import { dateFormatOptions } from "vega/components/ChartFormatting/VegaChartDateFormatting"
import { numberFormatOptions } from "components/chart-settings-format/chart-number-format"

const preventDefault = (e) => {
  e.preventDefault()
}

type Props = {
  baseDimensionType?: string | null
  baseDimensionFormat?: string
  sizeMeasureFormat?: string
  onDimensionFormat: (value: string) => void
  onMeasureNumberFormat: (value: string) => void
  axisLabel?: string
  lockToPercentage?: boolean
  disabled?: boolean
  tooltip?: string
}

const VegaChartFormatting: FC<Props> = ({
  baseDimensionType,
  baseDimensionFormat,
  sizeMeasureFormat,
  onDimensionFormat,
  onMeasureNumberFormat,
  axisLabel,
  lockToPercentage,
  disabled,
  tooltip
}) => {
  let formatSelector = null
  if (baseDimensionType && isNumericType(baseDimensionType)) {
    formatSelector = (
      <VegaChartFormatSelector
        format={baseDimensionFormat}
        axisLabel={axisLabel || "Base dimension format"}
        onFormatValueChange={onDimensionFormat}
        baseOptions={numberFormatOptions}
        disabled={disabled}
        tooltip={tooltip}
      />
    )
  } else if (baseDimensionType && isTimeType(baseDimensionType)) {
    formatSelector = (
      <VegaChartFormatSelector
        format={baseDimensionFormat}
        onFormatValueChange={onDimensionFormat}
        axisLabel={axisLabel || "Base dimension format"}
        baseOptions={dateFormatOptions}
        disabled={disabled}
        tooltip={tooltip}
      />
    )
  } else if (!baseDimensionType) {
    formatSelector = (
      <VegaChartFormatSelector
        format={sizeMeasureFormat}
        axisLabel={axisLabel || "Measure axis format"}
        onFormatValueChange={onMeasureNumberFormat}
        baseOptions={numberFormatOptions}
        lockToPercentage={lockToPercentage}
        disabled={disabled}
        tooltip={tooltip}
      />
    )
  }

  return (
    <form autoComplete="new-password" onSubmit={preventDefault}>
      {formatSelector}
    </form>
  )
}

export default VegaChartFormatting
