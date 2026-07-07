// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as vega from "vega"
import { dataVisitor, scaleVisitor } from "vega-functions"
import { ticks as arrayTicks } from "d3-array"
import { autoFormatter } from "import-shims/heavyai-d3-combo-chart"
import { isEqual } from "lodash"

import { toEpochIfDate } from "vega/utils/data"
import { immerseAutoFormatter } from "utils/auto-formatter"

vega.expressionFunction("toEpochIfDate", toEpochIfDate)

/**
 * Custom function that can be used in a vega expression to search a specified
 * data table for the first row that matches the given criteria. The criteria
 * is specified as an object of key/values pairs. For each row in the data
 * table, the keys are matched with the given values.
 * @param name The name of the data table to search
 * @param search The criteria to search for as an object of key/value pairs
 * @returns the first matching row from the data table, or null
 */
export function findindata(
  name: string,
  search: Record<string, any>
): any | null {
  // https://github.com/vega/vega/blob/4ad3d42cb9755f14a9981bc3afc17dfa8d35bbc8/packages/vega-functions/src/data.js
  const data = this.context.data[name]
  if (data) {
    return data.values.value.find((datum: Record<string, any>) =>
      // Value may be, for example, Date objects, necessitating a deep-equals
      Object.entries(search).every(([k, v]) => isEqual(datum[k], v))
    )
  }
  return null
}

vega.expressionFunction("findindata", findindata, dataVisitor)

/**
 * Given an array and extents, returns all of the values from the array from
 * the min to the max extent (inclusive).
 * @param ary The array
 * @param extents An array of [min, max] extents
 * @returns an array of all of the values between the min and max extents,
 * inclusive.
 */
export function valuesFromExtents<T>(ary: T[], extents: [T, T]): T[] {
  const minIdx = ary.indexOf(extents[0])
  const maxIdx = ary.lastIndexOf(extents[1])
  if (minIdx < 0 || maxIdx < 0) {
    return extents
  }
  return ary.slice(Math.min(minIdx, maxIdx), Math.max(minIdx, maxIdx) + 1)
}

vega.expressionFunction("valuesFromExtents", valuesFromExtents)

/**
 * Formats a value using a scale's format function
 * @param name The name of the scale
 * @param specifier A format specifier, or null to use the default
 * @param value The value to format
 * @returns the value formatted
 */
export function scaleFormat(
  name: string,
  specifier: string | null,
  value: any
): string {
  const scale = this.context.scales[name]
  if (scale && scale.value && typeof scale.value.tickFormat === "function") {
    return scale.value.tickFormat(null, specifier)(value)
  }
  return String(value)
}

vega.expressionFunction("scaleFormat", scaleFormat, scaleVisitor)

/**
 * Formats a value using the custom "autoFormatter"
 * @param value The value to format
 * @param specifier How to format the value
 * @returns the value formatted
 */
export function autoFormat(value: any, specifier: string): string {
  return immerseAutoFormatter(specifier)(value)
}

vega.expressionFunction("autoFormat", autoFormat)

/**
 * Formats a value or span of values based on extent and specifier,
 * with dynamic precision for percentages or numbers.
 * @param value The value to format
 * @param extent An array of [min, max] extents, if available
 * @param specifier A format specifier
 * @param fallback A fallback value if formatting fails
 * @param percentageDistributionEnabled Flag to enable percentage formatting logic
 * @returns the formatted value as a string
 */
export function autoFormatSpan(
  value: any,
  extent: [number, number] | null,
  specifier: string | null,
  fallback: any,
  percentageDistributionEnabled?: boolean
): string {
  if (specifier && !percentageDistributionEnabled) {
    // We do give percentage enabled axes a default specifier, but we'll
    // attempt to dynamically calculate precision below.
    return immerseAutoFormatter(specifier)(value)
  }

  if (
    extent &&
    typeof extent[0] === "number" &&
    typeof extent[1] === "number"
  ) {
    const [min, max] = extent
    if (percentageDistributionEnabled) {
      if (max - min <= 0.0001) {
        specifier = ".3%"
      } else if (max - min <= 0.002) {
        specifier = ".2%"
      } else if (max - min <= 0.05) {
        specifier = ".1%"
      } else if (specifier) {
        return immerseAutoFormatter(specifier)(value)
      }
    } else if (Math.abs(max) < 1000) {
      if (max - min <= 0.02) {
        specifier = ".4f"
      } else if (max - min <= 0.2) {
        specifier = ".3f"
      } else if (max - min <= 1.1) {
        specifier = ".2f"
      } else if (max - min < 100) {
        specifier = ".1f"
      } else if (max - min < 1000) {
        specifier = ".0f"
      }
    } else {
      specifier = "~s" // Significant digits for large numbers
    }
    // Use vega.format for locale-aware formatting, assuming defaultLocale().formatSpan exists or equivalent
    // In newer Vega versions, vega.format might be more directly used.
    // If vega.defaultLocale().formatSpan is not available, consider vega.format(specifier)(value)
    return vega.defaultLocale().formatSpan(min, max, null, specifier)(value)
  }

  if (fallback) {
    return String(fallback)
  }

  return String(value)
}

// Register the autoFormatSpan expression function
vega.expressionFunction("autoFormatSpan", autoFormatSpan)

/**
 * Reverses an array if the condition is true
 * @param arr An array (or falsey value)
 * @param cond Booleanish value
 * @returns arr if arr or cond are falsey; the reverse of arr otherwise
 */
export function reverseIf<T>(arr: T[], cond: boolean): T[] {
  if (arr && cond) {
    return arr.slice().reverse()
  }
  return arr
}

vega.expressionFunction("reverseIf", reverseIf)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * This function relates the scale's domain to the position on the panel, which
 * may be outside of the window.
 * @param name The name of the scrolling scale
 * @param value The value, from the domain, to scale
 * @returns The value's position on the internal panel
 */
export function scrollingScaleDomainToPanelPosition(
  name: string,
  value: any
): number {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.domainToPanelPosition === "function"
    ? scale.value.domainToPanelPosition(value)
    : undefined // Return undefined if not found or method is missing
}

// Register the scrollingScaleDomainToPanelPosition expression function
vega.expressionFunction(
  "scrollingScaleDomainToPanelPosition",
  scrollingScaleDomainToPanelPosition,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * This function relates a position on the panel to the window (range) of the
 * scrolling scale.
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns The value's position relative to the scale's range
 */
export function scrollingScalePanelPositionToRange(
  name: string,
  value: any
): number {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.panelPositionToRange === "function"
    ? scale.value.panelPositionToRange(value)
    : undefined
}

vega.expressionFunction(
  "scrollingScalePanelPositionToRange",
  scrollingScalePanelPositionToRange,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * This function is the inverse of `scrollingScalePanelPositionToRange`: given
 * a position relative to the window (range) of the scale, it returns the
 * position of that value on the internal panel.
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns The value's position on the internal panel
 */
export function scrollingScaleRangeToPanelPosition(
  name: string,
  value: any
): number {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.rangeToPanelPosition === "function"
    ? scale.value.rangeToPanelPosition(value)
    : undefined
}

vega.expressionFunction(
  "scrollingScaleRangeToPanelPosition",
  scrollingScaleRangeToPanelPosition,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * This function is the inverse of `scrollingScaleDomainToPanelPosition`: given
 * a position on the internal panel, it returns the value from the domain that
 * corresponds.
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns The value from the domain that corresponds to the position on the
 * internal panel.
 */
export function scrollingScalePanelPositionToDomain(
  name: string,
  value: any
): any {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.panelPositionToDomain === "function"
    ? scale.value.panelPositionToDomain(value)
    : undefined
}

vega.expressionFunction(
  "scrollingScalePanelPositionToDomain",
  scrollingScalePanelPositionToDomain,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * Additionally, in the case of the scrolling band scale, a continuous scale
 * can be overlaid on the scale for binning. This function calculates the
 * position of a value from the continuous scale on the panel.
 *
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns the panel position of the given continuous value
 */
export function scrollingBandContinuousToPanelPosition(
  name: string,
  value: any
): number {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.continuousToPanelPosition === "function"
    ? scale.value.continuousToPanelPosition(value)
    : undefined
}

vega.expressionFunction(
  "scrollingBandContinuousToPanelPosition",
  scrollingBandContinuousToPanelPosition,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * Additionally, in the case of the scrolling band scale, a continuous scale
 * can be overlaid on the scale for binning. This function is the opposite of
 * scrollingBandContinuousToPanelPosition: given a panel position, it returns
 * the corresponding value from the continuous scale.
 *
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns the panel position of the given continuous value
 */
export function scrollingBandPanelPositionToContinuous(
  name: string,
  value: any
): any {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.panelPositionToContinuous === "function"
    ? scale.value.panelPositionToContinuous(value)
    : undefined
}

vega.expressionFunction(
  "scrollingBandPanelPositionToContinuous",
  scrollingBandPanelPositionToContinuous,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * Additionally, in the case of the scrolling band scale, a continuous scale
 * can be overlaid on the scale for binning. This function converts a
 * continuous value to the output range.
 *
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns a value in the scale's range from the given continuous input.
 */
export function scrollingBandContinuousToRange(
  name: string,
  value: any
): number {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.continuousToRange === "function"
    ? scale.value.continuousToRange(value)
    : undefined
}

vega.expressionFunction(
  "scrollingBandContinuousToRange",
  scrollingBandContinuousToRange,
  scaleVisitor
)

/**
 * Think of scrolling scales as having a "panel" that contains the complete
 * chart. This panel can slide around a window, which only shows a portion of
 * the panel. The scale relates the domain to this window (the range of the
 * scale).
 *
 * Additionally, in the case of the scrolling band scale, a continuous scale
 * can be overlaid on the scale for binning. This function is the opposite of
 * scrollingBandContinuousToRange: given a value on the scale's range, return
 * the corresponding continuous value.
 *
 * @param name The name of the scrolling scale
 * @param value The value to scale
 * @returns the continuous value for the given value on the range
 */
export function scrollingBandRangeToContinuous(name: string, value: any): any {
  const scale = this.context.scales[name]
  return scale &&
    scale.value &&
    typeof scale.value.rangeToContinuous === "function"
    ? scale.value.rangeToContinuous(value)
    : undefined
}

vega.expressionFunction(
  "scrollingBandRangeToContinuous",
  scrollingBandRangeToContinuous,
  scaleVisitor
)

/**
 * Retrieve the domain of the visible portion of the continuous scale.
 *
 * @param name The name of the scrolling scale
 * @returns the domain of the continuous scale, considering scrolled position.
 */
export function scrollingBandBinnedDomain(
  name: string
): [any, any] | undefined {
  const scale = this.context.scales[name]
  return scale && scale.value && typeof scale.value.binDomain === "function"
    ? scale.value.binDomain()
    : undefined
}

vega.expressionFunction(
  "scrollingBandBinnedDomain",
  scrollingBandBinnedDomain,
  scaleVisitor
)

/**
 * Utility function to use autoFormatter for the tickFormat
 * @param scale The scale to add autoFormatter to
 * @returns the scale with a new tickFormat
 */
function addAutoFormatter<T extends vega.Scale>(scale: T): T {
  const copy = scale.copy
  const tickFormat = scale.tickFormat

  scale.copy = function scaleCopy(): T {
    return addAutoFormatter(copy())
  }

  // Override tickFormat for custom auto-formatting logic
  scale.tickFormat = function scaleTickFormat(
    count: number | null,
    specifier?: string | null
  ): (d: any) => string {
    if (specifier) {
      return autoFormatter(specifier)
    }

    const domain = scale.domain && scale.domain()
    const extent = Array.isArray(domain) &&
      domain.length > 0 && [domain[0], domain[domain.length - 1]]

    if (
      tickFormat &&
      extent &&
      typeof extent[0] === "number" &&
      typeof extent[1] === "number"
    ) {
      const [min, max] = extent
      let calculatedSpecifier: string | undefined = undefined

      if (Math.abs(max) < 1000) {
        if (max - min <= 0.02) {
          calculatedSpecifier = ".4f"
        } else if (max - min <= 0.2) {
          calculatedSpecifier = ".3f"
        } else if (max - min <= 1.1) {
          calculatedSpecifier = ".2f"
        } else if (max - min < 100) {
          calculatedSpecifier = ".1f"
        } else if (max - min < 1000) {
          calculatedSpecifier = ".0f"
        }
      } else {
        calculatedSpecifier = "s" // SI-prefix format for large numbers
      }
      return tickFormat(count, calculatedSpecifier)
    }

    return (v) => v
  }

  return scale
}

/** A band scale that allows scrolling */
export function scrollingBandScale(): vega.BandScale {
  const bandScale = vega.scale("band")().range([0, 1])
  const scrollingScale = vega.scale("linear")().domain([0, 1])
  const domain = bandScale.domain
  const range = scrollingScale.range
  const padding = bandScale.padding
  const paddingInner = bandScale.paddingInner
  const paddingOuter = bandScale.paddingOuter
  let minBandwidth = 1
  let scrollPercent = 0
  let zoomTo: [any, any] | null = null
  let binnedScaleType = "linear"
  let binnedScale: vega.Scale | null = null
  let maxTicks: number | null = null

  // Type assertion to ensure the returned scale matches vega.BandScale interface
  const scale = (d: any): number => {
    return scrollingScale(bandScale(d))
  }

  function rescale(): typeof scale {
    const n = bandScale.domain().length
    const containerLength = scrollingScale.range()[1]
    const panelLength = Math.max(
      containerLength,
      (n * minBandwidth) / (1 - paddingInner())
    )
    bandScale.range([0, panelLength])

    const newMaxScroll = panelLength - containerLength
    let scrollMin = scrollPercent * newMaxScroll
    let scrollMax = scrollMin + containerLength
    if (binnedScale) {
      // We use this to convert from a position on the panel to a label. The
      // domain needs to take into consideration paddings
      const step = bandScale.step()
      const outerPadding = step * paddingOuter()
      const halfInnerPadding = (step * paddingInner()) / 2
      binnedScale.range([
        outerPadding - halfInnerPadding,
        panelLength - outerPadding + halfInnerPadding
      ])

      if (zoomTo) {
        // NOTE: this does not consider the scrolling position. However, we
        // are essentially disabling scrolling in binned/continuous mode, so,
        // it's safe for now. But, should we ever need scrolling in a
        // continuous setting, we'll need to revisit this.
        scrollMin = binnedScale(zoomTo[0])
        scrollMax = binnedScale(zoomTo[1])
      }
    }

    scrollingScale.domain([scrollMin, scrollMax])

    return scale
  }

  scale.domain = function domainAccessor(_?: any[]): any[] | typeof scale {
    if (arguments.length) {
      domain(_)
      return rescale()
    } else {
      return domain()
    }
  }

  scale.range = function rangeAccessor(
    _?: [number, number]
  ): [number, number] | typeof scale {
    if (arguments.length) {
      range(_)
      return rescale()
    } else {
      return range()
    }
  }

  scale.padding = function paddingAccessor(_?: number): number | typeof scale {
    if (arguments.length) {
      padding(_)
      return rescale()
    } else {
      return padding()
    }
  }

  scale.paddingInner = function paddingInnerAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      paddingInner(_)
      return rescale()
    } else {
      return paddingInner()
    }
  }

  scale.paddingOuter = function paddingOuterAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      paddingOuter(_)
      return rescale()
    } else {
      return paddingOuter()
    }
  }

  scale.align = bandScale.align
  scale.bandwidth = bandScale.bandwidth
  scale.step = bandScale.step

  scale.minScroll = function minScroll(): number {
    return 0
  }

  scale.maxScroll = function maxScroll(): number {
    return Math.max(0, bandScale.range()[1] - scrollingScale.range()[1])
  }

  scale.scrollPercent = function scrollPercentAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      scrollPercent = _ as number
      return rescale()
    } else {
      return scrollPercent
    }
  }

  scale.zoomTo = function zoomToAccessor(
    _?: [any, any] | null
  ): [any, any] | null | typeof scale {
    if (arguments.length) {
      zoomTo = _ as [any, any] | null
      return rescale()
    } else {
      return zoomTo
    }
  }

  scale.minBandwidth = function minBandwidthAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      minBandwidth = _ as number
      return rescale()
    } else {
      return minBandwidth
    }
  }

  scale.binnedScaleType = function binnedScaleTypeAccessor(
    _?: string
  ): string | typeof scale {
    if (arguments.length) {
      binnedScaleType = _ as string
      if (binnedScale) {
        binnedScale = vega
          .scale(binnedScaleType)()
          .domain(binnedScale.domain())
          .range(binnedScale.range())
      }
      return scale
    } else {
      return binnedScaleType
    }
  }

  scale.binnedDomain = function binnedDomainAccessor(
    _?: any[] | null
  ): any[] | null | typeof scale {
    if (arguments.length) {
      if (_) {
        if (!binnedScale) {
          binnedScale = vega.scale(binnedScaleType)()
        }
        binnedScale.domain(_)
      } else {
        binnedScale = null
      }
      return rescale()
    } else {
      return binnedScale && binnedScale.domain()
    }
  }

  scale.minStep = function minStepAccessor(_?: number): number | typeof scale {
    if (arguments.length) {
      return scale.minBandwidth((_ as number) * (1 - scale.paddingInner()))
    } else {
      return minBandwidth * (1 - scale.paddingInner())
    }
  }

  scale.maxTicks = function scaleMaxTickGranularity(
    _?: number | null
  ): number | null | typeof scale {
    if (arguments.length) {
      maxTicks = _ as number | null
      return scale
    } else {
      return maxTicks
    }
  }

  scale.invert = function invert(v: number): any {
    // If v happens to fall in the padding, this'll return undefined - let's
    // find the closest value in that case
    let result = bandScale.invert(scrollingScale.invert(v))
    if (!result) {
      let steps = scale.bandwidth()
      let step = 1
      if (!Number.isInteger(steps) || steps <= 1) {
        // If we got here, we need to break up the padding some other way.
        // 5 is arbitrary
        step = steps / 5.0
        steps = 5
      }
      for (let i = step; result === undefined && i <= steps; i += step) {
        result =
          bandScale.invert(scrollingScale.invert(v - i)) ||
          bandScale.invert(scrollingScale.invert(v + i))
      }
    }
    return result
  }

  scale.domainToPanelPosition = function domainToPanelPosition(v: any): number {
    return bandScale(v)
  }

  scale.panelPositionToRange = function panelPositionToRange(
    v: number
  ): number {
    return scrollingScale(v)
  }

  scale.rangeToPanelPosition = function rangeToPanelPosition(
    v: number
  ): number {
    return scrollingScale.invert(v)
  }

  scale.panelPositionToDomain = function panelPositionToDomain(v: number): any {
    // If v happens to fall in the padding, this'll return undefined - let's
    // find the closest value in that case
    let result = bandScale.invert(v)
    const bandwidth = scale.bandwidth()
    for (let i = 1; result === undefined && i < bandwidth; i += 1) {
      result = bandScale.invert(v - i) || bandScale.invert(v + i)
    }
    return result
  }

  scale.continuousToPanelPosition = function continuousToPanelPosition(
    v: any
  ): number | undefined {
    return binnedScale && binnedScale(v)
  }

  scale.panelPositionToContinuous = function panelPositionToContinuous(
    v: number
  ): any {
    return binnedScale && binnedScale.invert(v)
  }

  scale.continuousToRange = function continuousToRange(
    v: any
  ): number | undefined {
    return binnedScale && scrollingScale(binnedScale(v))
  }

  scale.rangeToContinuous = function rangeToContinuous(v: number): any {
    return binnedScale && binnedScale.invert(scrollingScale.invert(v))
  }

  scale.binDomain = function getBinDomain(): [any, any] | undefined {
    const r = range() as [number, number]
    return (
      binnedScale && [
        scale.rangeToContinuous(r[0]),
        scale.rangeToContinuous(r[1])
      ]
    )
  }

  function filterDomain(offset: number): any[] {
    const max = (range() as [number, number])[1] - offset
    return (domain() as any[]).filter((d: any) => {
      const val = scale(d)
      return val >= 0 && val <= max
    })
  }

  scale.ticks = function ticks(count?: number): any[] {
    count = Math.min(count || 10, maxTicks)
    if (binnedScale) {
      // When binned, ticks appear half way between bars.
      const offset = (scale.step() * paddingInner()) / -2
      const filteredDomain = filterDomain(offset)
      if (filteredDomain.length <= count) {
        return filteredDomain
      }

      return arrayTicks(0, filterDomain.length, count).map(
        (i) => filteredDomain[i]
      )
    } else {
      // When not binned the ticks appear in the middle of the bars.
      const offset = scale.bandwidth() / 2
      return filterDomain(offset)
    }
  }

  scale.copy = function scaleCopy(): vega.BandScale {
    return scrollingBandScale()
      .domain(scale.domain())
      .range(scale.range() as [number, number])
      .paddingInner(scale.paddingInner())
      .paddingOuter(scale.paddingOuter())
      .align(scale.align())
      .bandwidth(scale.bandwidth())
      .step(scale.step())
      .scrollPercent(scale.scrollPercent())
      .minBandwidth(scale.minBandwidth())
      .binnedScaleType(scale.binnedScaleType())
      .binnedDomain(scale.binnedDomain())
  }

  return addAutoFormatter(scale)
}

// scale names must be all lowercase
vega.scale("scrollingband", scrollingBandScale, "discrete")

/** A linear scale that allows scrolling */
export function scrollingLinearScale(): vega.LinearScale {
  const linearScale = vega.scale("linear")().range([0, 1])
  const scrollingScale = vega.scale("linear")().domain([0, 1]).clamp(true)
  const domain = linearScale.domain
  const range = scrollingScale.range
  const bins = linearScale.bins
  const clamp = linearScale.clamp
  const padding = linearScale.padding
  const nice = linearScale.nice
  let panelLength = 0
  let scrollPercent = 0

  // Type assertion to ensure the returned scale matches vega.LinearScale interface
  function scale(d) {
    return scrollingScale(linearScale(d))
  }

  function rescale(): typeof scale {
    const containerLength = scrollingScale.range()[1]
    const newMaxScroll = Math.max(panelLength - containerLength, 0)
    const scrollPosition = scrollPercent * newMaxScroll
    linearScale.range([0, panelLength])
    scrollingScale.domain([scrollPosition, scrollPosition + containerLength])
    return scale
  }

  scale.domain = function domainAccessor(_?: any[]): any[] | typeof scale {
    if (arguments.length) {
      domain(_)
      return rescale()
    } else {
      return domain()
    }
  }

  scale.range = function rangeAccessor(
    _?: [number, number]
  ): [number, number] | typeof scale {
    if (arguments.length) {
      range(_)
      return rescale()
    } else {
      return range()
    }
  }

  scale.bins = function binsAccessor(
    _?: number[] | null
  ): number[] | null | typeof scale {
    if (arguments.length) {
      bins(_)
      return rescale()
    } else {
      return bins()
    }
  }

  scale.clamp = function clampAccessor(_?: boolean): boolean | typeof scale {
    if (arguments.length) {
      clamp(_)
      return rescale()
    } else {
      return clamp()
    }
  }

  scale.padding = function paddingAccessor(_?: number): number | typeof scale {
    if (arguments.length) {
      padding(_)
      return rescale()
    } else {
      return padding()
    }
  }

  scale.nice = function niceAccessor(
    _?: boolean | number
  ): boolean | number | typeof scale {
    if (arguments.length) {
      nice(_)
      return rescale()
    } else {
      return nice()
    }
  }

  scale.ticks = scrollingScale.ticks

  scale.minScroll = function minScroll(): number {
    return 0
  }

  scale.maxScroll = function maxScroll(): number {
    return Math.max(0, linearScale.range()[1] - scrollingScale.range()[1])
  }

  scale.scrollPercent = function scrollPercentAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      scrollPercent = _ as number
      return rescale()
    } else {
      return scrollPercent
    }
  }

  scale.panelLength = function panelLengthAccessor(
    _?: number
  ): number | typeof scale {
    if (arguments.length) {
      panelLength = _ as number
      return rescale()
    } else {
      return panelLength
    }
  }

  scale.copy = function scaleCopy(): vega.LinearScale {
    return scrollingLinearScale()
      .domain(scale.domain())
      .range(scale.range())
      .bins(scale.bins())
      .clamp(scale.clamp())
      .padding(scale.padding())
      .nice(scale.nice())
  }

  return addAutoFormatter(scale)
}

// scale names must be all lowercase
vega.scale("scrollinglinear", scrollingLinearScale, "continuous")

/** A linear scale with autoFormatter */
export function customLinear(): vega.LinearScale {
  const scale = vega.scale("linear")()
  return addAutoFormatter(scale)
}

// scale names must be all lowercase
vega.scale("customlinear", customLinear, "continuous")

export function customutc(): vega.TimeScale {
  const scale = vega.scale("utc")()
  const ticks = scale.ticks
  let maxTicks = null

  scale.maxTicks = function scaleMaxTickGranularity(
    _?: number | null
  ): number | null | typeof scale {
    if (arguments.length) {
      maxTicks = _ as number | null
      return scale
    } else {
      return maxTicks
    }
  }

  scale.ticks = function scaleTicks(count) {
    let result = ticks(count)
    if (maxTicks && result.length > maxTicks) {
      result = ticks(maxTicks)
    }
    return result
  }

  scale.copy = function scaleCopy(): vega.TimeScale {
    return customutc()
      .domain(scale.domain())
      .range(scale.range())
      .interpolate(scale.interpolate())
      .clamp(scale.clamp())
      .nice(scale.nice())
  }

  return scale
}

vega.scale("customutc", customutc, ["continuous", "temporal"])

const { renderer: BaseSVGRenderer, ...SVGModule } = vega.renderModule("svg")

/**
 * Custom SVG renderer outputs data-* attributes.
 * Rewritten as an ES6 class extending Vega's BaseSVGRenderer.
 */
class CustomSVGRenderer extends BaseSVGRenderer {
  // Override the _update method to add custom data attributes and classes
  // eslint-disable-next-line no-underscore-dangle
  _update(mdef: any, el: SVGElement, item: any) {
    // eslint-disable-next-line no-underscore-dangle
    super._update(mdef, el, item) // Call the parent's _update method

    // set class(es) and data attributes for annotations
    if (item.omniAnnotationType) {
      if (item.omniAnnotation) {
        Object.entries(item.omniAnnotation).forEach(([k, v]) => {
          // Ensure values assigned to dataset are strings
          el.dataset[k] = String(v)
        })
      }
      if (item.omniAnnotationFormatted) {
        el.dataset.annotationFormatted = String(item.omniAnnotationFormatted)
      }

      const annotationType = item.omniAnnotationType || "anchor"
      if (annotationType === "area" || annotationType === "both") {
        el.classList.add("annotation-area")
      }
      if (annotationType === "anchor" || annotationType === "both") {
        el.classList.add("annotation-anchor")
      }
      if (annotationType === "label") {
        el.classList.add("annotation-label")
      }
    }
  }
}

// Register the custom SVG renderer with Vega
vega.renderModule("svg", {
  ...SVGModule,
  renderer: CustomSVGRenderer
})

/**
 * Custom transform function - given a point and the bounds of a rectangle, it
 * will compute where a line from the point to the rectangle's center would
 * intersect the rectangle.
 * Rewritten as an ES6 class extending Vega's Transform.
 */
class IntersectRectangle extends vega.Transform {
  // Static Definition required by Vega for transforms
  static Definition = {
    type: "IntersectRectangle",
    metadata: { modifies: true },
    params: [
      { name: "x", type: "field", required: true },
      { name: "y", type: "field", required: true },
      { name: "bounds", type: "field", required: true },
      { name: "asX", type: "string", required: true },
      { name: "asY", type: "string", required: true }
    ]
  }

  // Constructor for the IntersectRectangle transform
  constructor(params: vega.ExprParse) {
    super(null, params) // Call the parent Transform constructor
  }

  /**
   * Overrides the transform function to provide the core logic.
   * @param _ The transform parameters (from `this.parameters`)
   * @param pulse The Vega dataflow pulse
   * @returns The modified pulse
   */
  transform(_: any, pulse: vega.Pulse): vega.Pulse {
    const { x: fax, y: fay, bounds: fbounds, asX, asY } = _

    pulse.visit(pulse.SOURCE, (t: any) => {
      const ax = fax(t)
      const ay = fay(t)
      const bounds = fbounds(t)

      if (
        ax >= bounds.x1 &&
        ax <= bounds.x2 &&
        ay >= bounds.y1 &&
        ay <= bounds.y2
      ) {
        // point is inside rectangle, return original point
        t[asX] = ax
        t[asY] = ay
        return
      }

      // calculate the half width and height, and the center point
      const hw = (bounds.x2 - bounds.x1) / 2
      const hh = (bounds.y2 - bounds.y1) / 2
      const bx = bounds.x1 + hw
      const by = bounds.y1 + hh

      if (ax === bx) {
        // special case when ax === bx as that makes the slope Inf (vertical line)
        t[asX] = bx
        t[asY] = ay < bounds.y1 ? bounds.y1 : bounds.y2
        return
      }

      // calculate slope and determine which side we intersect
      const s = (ay - by) / (ax - bx)

      // Check for intersection with vertical sides
      if (Math.abs(s * hw) <= hh) {
        if (ax > bx) {
          // line enters the right side
          t[asX] = bx + hw
          t[asY] = by + s * hw
        } else {
          // line enters the left side
          t[asX] = bx - hw
          t[asY] = by - s * hw
        }
      }
      // Check for intersection with horizontal sides
      else if (ay > by) {
        // line enters the bottom
        t[asX] = bx + hh / s
        t[asY] = by + hh
      } else {
        // line enters the top
        t[asX] = bx - hh / s
        t[asY] = by - hh
      }
    })

    // Notify Vega of modified fields
    return pulse.reflow(_.modified()).modifies(asX).modifies(asY)
  }
}

// Add the custom transform to Vega's transforms registry
// Name _must_ be lowercase for Vega's internal lookup
vega.transforms.intersectrectangle = IntersectRectangle

export default vega
