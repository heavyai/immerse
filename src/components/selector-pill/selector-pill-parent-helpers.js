// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { lensPath, view } from "ramda"
import { CHARTS } from "constants/charts"
import cx from "classnames"
import { MEASURE_NAME_ALIASES } from "constants/data-aliases"

export function getSelectorAlias(type, selector = {}, dimensionsLength) {
  if (selector.selectorType === "dimensions") {
    if (selector.value && type === "table") {
      return `Col ${selector.index + 1}`
    } else if (view(lensPath([type, "minDimensions"]), CHARTS)) {
      return selector.name
    }
  } else if (selector.selectorType === "measures") {
    if (selector.value && type === "table") {
      const index = selector.index + dimensionsLength + 1
      return `Col ${index}`
    } else if (selector.value && type === "line2") {
      const index = selector.index + 1
      return `y axis ${index}`
    } else if (selector.name && MEASURE_NAME_ALIASES[type]) {
      return MEASURE_NAME_ALIASES[type][selector.name]
    }
  }
  return null
}

export function getSelectorPillStyles({
  chartType,
  isError,
  isOver,
  label,
  isRequired,
  name,
  inactive
}) {
  return cx("selector-pill", {
    "is-required": isRequired && !label,
    empty: !label,
    "is-error": isError,
    "is-over": isOver,
    "center-label": name && chartType !== "table" && !label,
    inactive
  })
}

export function getBinIntervalLabel(timeBin = "", extract = false) {
  switch (timeBin) {
    case "decade":
      return "10yr"
    case "quarter":
      return "qtr"
    case "year":
      return "1yr"
    case "month":
      return "mo"
    case "week":
      return "wk"
    case "day":
      return extract ? "dom" : "day"
    case "hour":
      return "hr"
    case "minute":
      return "min"
    case "second":
      return "sec"
    case "isodow":
      return "dow"
    default:
      return "auto"
  }
}
