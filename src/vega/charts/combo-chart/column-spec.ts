// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Rather than trying to maintain two different specs for column vs row charts,
// this script will automate the creation of a column spec from the row spec.
// The only real difference is that we need to exchange widths and heights, x's
// and y's, etc, and that can certainly be automated!
import { Axis, Mark, Scale, Signal, Spec } from "vega"

import { SpecOptions } from "./row-spec"
import { invert } from "lodash"

// PROPERTY_MAP maps row -> column properties
// PROPERTY_MAP_INVERTED maps column -> row properties
const PROPERTY_MAP: Record<string, string> = {
  width: "height",
  height: "width",
  x: "y",
  x2: "y2",
  y: "x",
  y2: "x2",
  dx: "dy",
  dy: "dx",
  xc: "yc",
  yc: "xc"
}
const PROPERTY_MAP_INVERTED = invert(PROPERTY_MAP)

// VALUE_MAP maps row -> column properties
// VALUE_MAP_INVERTED maps column -> row properties
const VALUE_MAP: Record<string, string> = {
  width: "height",
  height: "width",
  deltaX: "deltaY",
  deltaY: "deltaX",
  horizontal: "vertical",
  vertical: "horizontal",
  x: "y",
  x2: "y2",
  y: "x",
  y2: "x2",
  "ns-resize": "ew-resize"
}
const VALUE_MAP_INVERTED = invert(VALUE_MAP)

// Same for the rest of these, the _INVERTED objects are used to convert from column -> row
const VALUE_KEYS = Object.keys(VALUE_MAP).map((key) => {
  key = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return /\w$/.test(key) ? `${key}\\b` : `${key}\\B`
})
const VALUE_KEYS_INVERTED = Object.keys(VALUE_MAP_INVERTED).map((key) => {
  key = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return /\w$/.test(key) ? `${key}\\b` : `${key}\\B`
})
const VALUE_REGEXP = new RegExp(`\\b(${VALUE_KEYS.join("|")})`, "g")
const VALUE_REGEXP_INVERTED = new RegExp(
  `\\b(${VALUE_KEYS_INVERTED.join("|")})`,
  "g"
)

const SPECIAL_CASES: Record<string, Function> = {
  "scales[]": (scale: Scale, opts: SpecOptions): Scale => {
    scale = translateSpecFragment("scales[]", scale, opts)
    if (scale.name === "binnedTimeDimension") {
      scale.reverse = false
    }
    return scale
  },
  "axes[]": (axis: Axis, opts: SpecOptions): Axis => {
    if (axis.orient === "left") {
      const newAxis = {
        ...translateSpecFragment("axes[]", axis, opts),
        orient: "bottom",
        labelAlign: opts.enableContinuousDimension ? "center" : "right",
        labelAngle: opts.enableContinuousDimension ? 0 : 270,
        labelBaseline: opts.enableContinuousDimension ? "top" : "middle"
      }
      return newAxis
    } else if (axis.orient === "bottom") {
      const newAxis = translateSpecFragment("axes[]", axis, opts)
      newAxis.orient = "left"
      return newAxis
    } else if (axis.orient === "top") {
      const newAxis = translateSpecFragment("axes[]", axis, opts)
      newAxis.orient = "right"
      return newAxis
    } else {
      return translateSpecFragment("axes[]", axis, opts)
    }
  },
  "marks[].signals[]": (signal: Signal, opts: SpecOptions) => {
    if (signal.name !== "clip") {
      signal = translateSpecFragment("marks[].signals[]", signal, opts)
    }
    return signal
  },
  "marks[].marks[].marks[]": (mark: Mark, opts: SpecOptions) => {
    mark = translateSpecFragment("marks[].marks[].marks[]", mark, opts)
    if (mark.name === "barAnnotationAnchors") {
      mark.encode.update.y = { field: "y" }
    } else if (mark.name === "barLabel") {
      mark.encode.update.angle = { value: -90 }
      mark.encode.update.y = [
        {
          test:
            "datum.datum.measure < 0 !== datum.height < autoFormatSpan(datum.datum.measure, datum.datum.axis === 'primary' ? primaryMeasureDomain : secondaryMeasureDomain, primaryMeasureFormat).length * 8",
          field: "y2",
          offset: -5
        },
        { field: "y", offset: 5 }
      ]
    } else if (mark.name === "area" || mark.name === "line") {
      mark.encode.update.path.forEach((path) => {
        if (path.signal) {
          // The path's signal looks something like this:
          //   'M' + x + ',' + y + 'L' + x + ',' + y + ...
          // We need to reverse all the x's and y's.
          path.signal = path.signal.replace(
            /'(M|L)' \+ (.*?) \+ ',' \+ (.*?)(?:(?= \+ '(?:M|L|Z)')|$)/g,
            (_, s, x, y) => `'${s}' + ${y} + ',' + ${x}`
          )
        }
      })
    }
    return mark
  },
  "signals[]": (signal: Signal, opts: SpecOptions) => {
    if (signal.name === "zoomAmount") {
      return signal
    }
    if (signal.name === "zoomFilter" && signal.on) {
      const translatedZoomSignal = translateSpecFragment(
        "signals[]",
        signal,
        opts
      )
      translatedZoomSignal.on = translatedZoomSignal.on.map((on) =>
        on.events === "wheel!"
          ? {
              ...on,
              update: on.update.replace(/\bevent\.deltaX\b/g, "event.deltaY")
            }
          : on
      )
      return translatedZoomSignal
    }
    return translateSpecFragment("signals[]", signal, opts)
  }
}

function translateValue(
  path: string,
  value: any,
  opts: SpecOptions,
  inverted = false
): any {
  const valueMap = inverted ? VALUE_MAP_INVERTED : VALUE_MAP
  const valueRegexp = inverted ? VALUE_REGEXP_INVERTED : VALUE_REGEXP
  if (SPECIAL_CASES[path]) {
    return SPECIAL_CASES[path](value, opts)
  } else if (Array.isArray(value)) {
    return value.map((v) => translateValue(`${path}[]`, v, opts, inverted))
  } else if (value && typeof value === "object") {
    return translateSpecFragment(path, value, opts, inverted)
  } else if (typeof value === "string") {
    return value.replace(valueRegexp, (_match, k) => valueMap[k])
  }
  return value
}

function translateSpecFragment<T>(
  path: string,
  fragment: T,
  opts: SpecOptions,
  inverted = false
): T {
  const propertyMap = inverted ? PROPERTY_MAP_INVERTED : PROPERTY_MAP
  return Object.fromEntries(
    Object.entries(fragment).map(([key, value]) => {
      if (propertyMap[key]) {
        key = propertyMap[key]
      }

      value = translateValue(
        path.length > 0 ? `${path}.${key}` : key,
        value,
        opts,
        inverted
      )
      return [key, value]
    })
  )
}

export function transformRowSpecToColumn(spec: Spec, opts: SpecOptions): Spec {
  return translateSpecFragment("", spec, opts)
}
export function transformColumnSpecToRow(spec: Spec, opts: SpecOptions): Spec {
  return translateSpecFragment("", spec, opts, true)
}
