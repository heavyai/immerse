// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { GaugeChart, formatAsPercentage } from "heavy-gauge-chart"

import {
  useChartData,
  useSetCrossFilter,
  useChartUpdate,
  useSimpleFilters
} from "charts/utils/hooks"

import { FILTER_TYPE_BETWEEN } from "vega/constants/filter-type-constants"

import "./gauge.scss"

const NUM_DECIMALS = 2

const getColor = (colors, idx, reverse) => {
  if (!reverse) {
    return colors[idx]
  } else {
    return colors[colors.length - 1 - idx]
  }
}

const numeric = (v) => {
  const num = parseFloat(v, 10)
  return isNaN(num) ? undefined : num
}

const getRunningStart = (segments, i) => {
  let size = 0
  for (let j = 0; j < i; j++) {
    size += segments[j].size
  }
  return size
}

const ImmerseGaugeChart = ({ id, chart }) => {
  const data = useChartData(id, { forceAggregate: true })?.[0]

  const setBaseFilter = useSetCrossFilter({
    chartId: id,
    columns: chart.measures.filter((d) => d.name === "base"),
    name: "base"
  })
  const baseFilter = useSimpleFilters({ chartId: id, name: "base" })

  const setWedgeFilter = useSetCrossFilter({
    chartId: id,
    columns: chart.measures.filter((d) => d.name === "base"),
    name: "wedge"
  })
  const wedgeFilter = useSimpleFilters({ chartId: id, name: "wedge" })

  const setSelections = useChartUpdate(id, "selections")
  const selections = new Set(
    wedgeFilter && chart.selections ? chart.selections : []
  )

  const unfilteredData = useChartData(id, {
    forceAggregate: true,
    unfiltered: true,
    shouldUpdate: false,
    shouldExecute: chart.unfilteredValues
  })

  /*
    for each of the target, min, and max, we can use one of several values, in order:
      * the override value provided by the chart.
      * the unfiltered value (if we have it)
      * the filtered value
    max's calculations are a little more complicated -
      * we use the above, in order.
      * if we -still- don't have anything, then use double the value so it's nicely in the middle.
      * Finally, confirm that the max is not less than the min, and if it is, set it to one higher.
  */

  const target =
    numeric(chart.targetOverride) ?? unfilteredData?.target ?? data?.target
  const min =
    numeric(chart.minOverride) ??
    unfilteredData?.minMeter ??
    data?.minMeter ??
    (data?.base < 0 ? data?.base * 2 : 0)
  const val = baseFilter ?? data?.base ?? min
  const interimMax =
    numeric(chart.maxOverride) ??
    unfilteredData?.maxMeter ??
    data?.maxMeter ??
    (val > 0 ? val * 2 : 0)
  const max = interimMax <= min ? min + 1 : interimMax

  let runningSize = min

  const createWedgeLabel = (segment, i, showAbsoluteValues = false) => {
    const mySize = runningSize
    runningSize += segment.size * (max - min)

    if (i === 0) {
      return undefined
    } else if (typeof mySize !== "number") {
      return 0
    } else if (!showAbsoluteValues) {
      return formatAsPercentage(mySize / (max - min))
    } else {
      return mySize.toFixed(NUM_DECIMALS)
    }
  }

  const canFilterWedges =
    numeric(chart.minOverride) !== undefined &&
    numeric(chart.maxOverride) !== undefined

  const wedges = chart.segments.map((segment, i) => ({
    size: segment.size,
    color:
      !selections.size || selections.has(i)
        ? getColor(chart.color.val, i, chart.color.reverse)
        : "#c7c7c7",
    label: createWedgeLabel(segment, i, chart.showAbsoluteValues)
  }))

  const gaugeVal = typeof val !== "number" ? 0 : val

  const wedgeCallback =
    canFilterWedges &&
    ((i) => {
      // okay, we're not gonna try to filter on wedges AT ALL unless we've overridden them.
      // there's extra logic we need to resize things appropriately otherwise.
      if (canFilterWedges) {
        if (selections.has(i)) {
          selections.delete(i)
        } else {
          selections.add(i)
        }
        const selectionsArray = Array.from(selections)
        setSelections(selectionsArray)

        const filters = []

        selectionsArray.forEach((selection) => {
          const start = getRunningStart(wedges, selection)
          const end = start + wedges[selection].size
          const delta = numeric(chart.maxOverride) - numeric(chart.minOverride)
          filters.push({
            [FILTER_TYPE_BETWEEN]: [
              numeric(chart.minOverride) + delta * start,
              numeric(chart.minOverride) + delta * end
            ]
          })
        })

        setWedgeFilter(filters.length ? filters : undefined)
      }
    })

  return (
    <div className="gauge-component" id={`chart${id}`}>
      <GaugeChart
        startLabel={
          chart.showAbsoluteValues && typeof min === "number"
            ? min.toFixed(NUM_DECIMALS)
            : "0%"
        }
        endLabel={
          chart.showAbsoluteValues && typeof max === "number"
            ? max.toFixed(NUM_DECIMALS)
            : "100%"
        }
        min={min}
        max={max}
        value={gaugeVal}
        valueLabel={
          chart.showAbsoluteValues && typeof val === "number"
            ? val.toFixed(NUM_DECIMALS)
            : undefined
        }
        targetValue={typeof target !== "number" ? undefined : target}
        targetLabel={
          chart.showAbsoluteValues && typeof target === "number"
            ? target.toFixed(NUM_DECIMALS)
            : undefined
        }
        wedges={wedges}
        minNeedleAngle={-5}
        maxNeedleAngle={185}
        needleLabelOffset={20}
        duration={400}
        wedgeCallback={wedgeCallback}
        needleCallback={() => setBaseFilter(baseFilter ? undefined : gaugeVal)}
        needleClasses={baseFilter ? "gauge-needle-selected" : undefined}
      />
    </div>
  )
}

export default ImmerseGaugeChart
