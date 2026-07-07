// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import d3 from "services/d3"
import dc from "services/dc"
import { TIME_UNITS } from "constants/data-types"

export function xDomain(field) {
  if (field.extract) {
    switch (field.timeBin) {
      case "year":
        return [
          field.currentLowValue.getFullYear(),
          field.currentHighValue.getFullYear()
        ]
      case "quarter":
        return [1, 4]
      case "isodow":
        return [1, 7]
      case "month":
        return [1, 12]
      case "day":
        return [1, 31]
      case "hour":
        return [0, 23]
      case "minute":
        return [0, 59]
      default:
        return [1, 7]
    }
  } else {
    return [field.currentLowValue, field.currentHighValue]
  }
}

export const getD3Scale = (field) =>
  field.extract || !(field.type in TIME_UNITS)
    ? d3.scale.linear()
    : d3.time.scale.utc()

export const xScale = (field) => getD3Scale(field)

export function xAxisTickFormat(field) {
  if (field.extract) {
    return dc.utils.extractTickFormat(field.timeBin)
  } else if (field.type in TIME_UNITS) {
    return dc.utils.customTimeFormat
  } else {
    return formatNumber
  }
}

const formatSi = d3.format(".2s")

// https://github.com/d3/d3-format#locale_formatPrefix
export function formatNumber(value) {
  const abbrValue =
    Math.abs(value) > 100 && Math.abs(value) < 1000
      ? d3.format(".3s")(value)
      : formatSi(value)

  const abbr = abbrValue.slice(-1)

  if (abbr === "m") {
    // milli-second
    return Math.round(value * 100) / 100
  } else if (abbr === "G") {
    // Giga (1000000000)
    return `${abbrValue.slice(0, -1)}B`
  } else {
    return abbrValue
  }
}

export const calculateLogScaleMin = (dataMin, dataMax, k = 1) => {
  const scaledMin = dataMax / Math.pow(10, k)
  return dataMin <= 0 ? scaledMin : Math.max(dataMin, scaledMin)
}
