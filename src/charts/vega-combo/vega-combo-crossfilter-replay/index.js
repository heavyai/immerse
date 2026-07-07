// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from "react"

import addMilliseconds from "date-fns/addMilliseconds"
import differenceInMilliseconds from "date-fns/differenceInMilliseconds"

import addSeconds from "date-fns/addSeconds"
import dateFnsDifferenceInSeconds from "date-fns/differenceInSeconds"
const differenceInSeconds = (v1, v2) =>
  dateFnsDifferenceInSeconds(v1, v2, { roundingMethod: "ceil" })

import addMinutes from "date-fns/addMinutes"
import dateFnsDifferenceInMinutes from "date-fns/differenceInMinutes"
const differenceInMinutes = (v1, v2) =>
  dateFnsDifferenceInMinutes(v1, v2, { roundingMethod: "ceil" })

import addHours from "date-fns/addHours"
import dateFnsDifferenceInHours from "date-fns/differenceInHours"
const differenceInHours = (v1, v2) =>
  dateFnsDifferenceInHours(v1, v2, { roundingMethod: "ceil" })

import addDays from "date-fns/addDays"
// import differenceInDays from "date-fns/differenceInDays"
const differenceInDays = (v1, v2) =>
  Math.ceil(dateFnsDifferenceInHours(v1, v2, { roundingMethod: "ceil" }) / 24)

import addWeeks from "date-fns/addWeeks"
import dateFnsDifferenceInWeeks from "date-fns/differenceInWeeks"

import addMonths from "date-fns/addMonths"
import dateFnsDifferenceInMonths from "date-fns/differenceInMonths"

import addQuarters from "date-fns/addQuarters"
import dateFnsDifferenceInQuarters from "date-fns/differenceInQuarters"

import addYears from "date-fns/addYears"
// import differenceInYears from "date-fns/differenceInYears"

// To get the filter bins offset properly, import in all the start/end functions too
import startOfSecond from "date-fns/startOfSecond"
import endOfSecond from "date-fns/endOfSecond"

import startOfMinute from "date-fns/startOfMinute"
import endOfMinute from "date-fns/endOfMinute"

import startOfHour from "date-fns/startOfHour"
import endOfHour from "date-fns/endOfHour"

import startOfDay from "date-fns/startOfDay"
import endOfDay from "date-fns/endOfDay"

import dateFnsStartOfWeek from "date-fns/startOfWeek"

import endOfWeek from "date-fns/endOfWeek"

import startOfMonth from "date-fns/startOfMonth"
import endOfMonth from "date-fns/endOfMonth"

import startOfQuarter from "date-fns/startOfQuarter"
import endOfQuarter from "date-fns/endOfQuarter"

import startOfYear from "date-fns/startOfYear"
import endOfYear from "date-fns/endOfYear"

import startOfDecade from "date-fns/startOfDecade"
import endOfDecade from "date-fns/endOfDecade"

import getYear from "date-fns/getYear"

import { isTimeType, isNumericType } from "constants/data-types"

import { CrossFilterReplayIcon } from "chart-addons/crossfilter-replay/CrossFilterReplayIcon"

import {
  FILTER_TYPE_AND as AND,
  FILTER_TYPE_MULTISOURCE as MULTISOURCE,
  FILTER_TYPE_BETWEEN as BETWEEN,
  FILTER_TYPE_OR as OR
} from "vega/constants/filter-type-constants"

import {
  getChartAddonOfType,
  getChartAddonTypes,
  registerChartAddon
} from "chart-addons/chart-addon-registry"

// const addDelta = addHours
// const diffDelta = differenceInHours

import {
  useChart,
  useCurrentFilterSet,
  useSimpleFilters,
  useSetCrossFilter,
  useCachedChartData
} from "charts/utils/hooks"

import { useStaticValue } from "hooks"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { START_OF_WEEK, ENABLE_CROSSFILTER_REPLAY } = available_feature_flags

const weekMap = { week: 1, week_sunday: 0, week_saturday: 6 }

const startOfWeek = (w) =>
  dateFnsStartOfWeek(w, {
    weekStartsOn: weekMap[getFeatureFlag(START_OF_WEEK)]
  })

const differenceInWeeks = (v1, v2) =>
  // hilarious. I should've gone into stand up comedy
  Math.ceil(
    dateFnsDifferenceInWeeks(
      addDays(endOfWeek(v1), 1),
      dateFnsStartOfWeek(v2),
      {
        roundingMethod: "ceil"
      }
    )
  )

const differenceInMonths = (v1, v2) =>
  Math.ceil(
    dateFnsDifferenceInMonths(addDays(endOfMonth(v1), 1), startOfMonth(v2), {
      roundingMethod: "ceil"
    })
  )

const differenceInQuarters = (v1, v2) =>
  Math.ceil(
    dateFnsDifferenceInQuarters(
      addDays(endOfQuarter(v1), 1),
      startOfQuarter(v2),
      {
        roundingMethod: "ceil"
      }
    )
  )
const differenceInYears = (v1, v2) => getYear(v1) - getYear(v2) + 1

const DEFAULT_TIME_UNIT = "millisecond"

const allTimeBinUnits = [
  {
    label: "ms",
    value: "millisecond"
  },
  {
    label: "s",
    value: "second"
  },
  {
    label: "min",
    value: "minute"
  },
  {
    label: "hr",
    value: "hour"
  },
  {
    label: "qd",
    value: "quarterday"
  },
  {
    label: "day",
    value: "day"
  },
  {
    label: "wk",
    value: "week"
  },
  {
    label: "mo",
    value: "month"
  },
  {
    label: "q",
    value: "quarter"
  },
  {
    label: "y",
    value: "year"
  },
  {
    label: "dec",
    value: "decade"
  },
  {
    label: "cen",
    value: "century"
  },
  {
    label: "ml",
    value: "millenium"
  }
]

/*
  I kinda hate date-fns right now. SOME of the delta functions accept an optional
  third options parameter that lets you set the roundingMethod.
  BUT NOT ALL OF THEM.
  So use it where you can, and otherwise drop down to the lower item that has it
  to get the ceiling'ed value instead. Fix this if the library ever properly
  updates to add roundingMethod to the other functions. Maybe I'll send them
  a patch.

  Our delta dispatch is, in order, the additive function, the delta function, the start of function,
  and the end of function.

  NOTE - some of the start/ends don't look right. Like, why are we using startOfHour for quarterDay?
  because the quarterDay value is still going to -be- an hour value, so that's where we bind it.
  etc. etc. etc.
*/

// We also apply a default start/end function for the numeric case so we can just apply it willy-nilly.
// and also deal with ms which doesn't have a concept of it since we lack resolution
const defaultStart = (v) => v
const defaultEnd = (v) => v

const deltaDispatch = {
  millisecond: [
    addMilliseconds,
    differenceInMilliseconds,
    defaultStart,
    defaultEnd
  ],
  second: [addSeconds, differenceInSeconds, startOfSecond, endOfSecond],
  minute: [addMinutes, differenceInMinutes, startOfMinute, endOfMinute],
  hour: [addHours, differenceInHours, startOfHour, endOfHour],
  quarterday: [
    (v, delta) => addHours(v, delta * 6),
    (v1, v2) =>
      Math.ceil(differenceInHours(v1, v2, { roundingMethod: "ceil" }) / 6),
    startOfHour,
    endOfHour
  ],
  day: [addDays, differenceInDays, startOfDay, endOfDay],
  week: [addWeeks, differenceInWeeks, startOfWeek, endOfWeek],
  month: [addMonths, differenceInMonths, startOfMonth, endOfMonth],
  quarter: [addQuarters, differenceInQuarters, startOfMonth, endOfMonth],
  year: [addYears, differenceInYears, startOfYear, endOfYear],
  decade: [
    (v, delta) => addYears(v, delta * 10),
    (v1, v2) => Math.ceil(differenceInYears(v1, v2) / 10),
    startOfDecade,
    endOfDecade
  ],
  century: [
    (v, delta) => addYears(v, delta * 100),
    (v1, v2) => Math.ceil(differenceInYears(v1, v2) / 100),
    startOfYear,
    endOfYear
  ],
  millennium: [
    (v, delta) => addYears(v, delta * 1000),
    (v1, v2) => Math.ceil(differenceInYears(v1, v2) / 1000),
    startOfYear,
    endOfYear
  ]
}

const numericDeltas = [
  (v, delta) => v + delta,
  (v1, v2) => v1 - v2,
  defaultStart,
  defaultEnd
]

const getDeltaFunctions = (columnType, timeUnit) => {
  if (isTimeType(columnType)) {
    return deltaDispatch[timeUnit] || deltaDispatch[DEFAULT_TIME_UNIT]
  } else if (isNumericType(columnType)) {
    return numericDeltas
  } else {
    return []
  }
}

const { CHART_ADDON_CROSSFILTER_REPLAY } = getChartAddonTypes()
const CrossFilterReplay = getChartAddonOfType(CHART_ADDON_CROSSFILTER_REPLAY)
  .component

export const VegaComboCrossFilterReplay = ({ chartId, chartAddonId }) => {
  const chart = useChart(chartId)
  const currentFilterSet = useCurrentFilterSet()

  const columnType = chart.dataSelections[0].dimensions.xAxis[0].column.type

  const rangeFilter = useSimpleFilters({
    chartId,
    name: `zone${currentFilterSet.id}-chart${chartId}-range-crossfilter`,
    useGeneratedInternalId: false
  })

  const focusData = useCachedChartData({ chartId, token: "minMaxQuery-0" })

  const minMaxFilter = useStaticValue(
    focusData && {
      [MULTISOURCE]: {
        [AND]: [
          {
            [BETWEEN]: [
              focusData?.[0]?.dimensionMin,
              focusData?.[0]?.dimensionMax
            ]
          }
        ]
      }
    }
  )

  const categoryData = useCachedChartData({
    chartId,
    token: "combo-0"
  })

  const categoryDataFilter = useStaticValue(
    categoryData && {
      [MULTISOURCE]: {
        [AND]: [
          {
            [OR]: [
              {
                [AND]: categoryData?.map((d) => d.dimension0)
              }
            ]
          }
        ]
      }
    }
  )

  const timeUnit = chart.binSettings?.timeUnit
  const [addDelta, diffDelta, startOfDelta] = getDeltaFunctions(
    columnType,
    timeUnit
  )

  const filter = rangeFilter || minMaxFilter || categoryDataFilter

  const setCrossFilter = useSetCrossFilter({
    chartId,
    columns: [chart.dataSelections[0].dimensions.xAxis[0].column],
    name: `zone${currentFilterSet.id}-chart${chartId}-crossfilter`,
    useGeneratedInternalId: false,
    dataSource: chart.dataSelections[0].table.name
  })

  const calculateDelta = useCallback(
    (f, frames) => {
      return (
        diffDelta(
          f[MULTISOURCE][AND][0][BETWEEN][1],
          f[MULTISOURCE][AND][0][BETWEEN][0]
        ) / frames
      )
    },
    [diffDelta]
  )

  const updateFilterAtFrame = useCallback(
    ({ filter: f, frame, frames }) => {
      if (!isTimeType(columnType) && !isNumericType(columnType)) {
        const val = [f[MULTISOURCE][AND][0][OR][0][AND][frame - 1]][0]
        return {
          [MULTISOURCE]: {
            [AND]: [
              {
                [OR]: [
                  {
                    [AND]: [val]
                  }
                ]
              }
            ]
          }
        }
      }

      const delta = calculateDelta(f, frames)

      const newFilter = {
        [MULTISOURCE]: {
          [AND]: [
            {
              BETWEEN: [
                addDelta(
                  startOfDelta(f[MULTISOURCE][AND][0][BETWEEN][0]),
                  delta * (frame - 1)
                ),
                addDelta(
                  startOfDelta(f[MULTISOURCE][AND][0][BETWEEN][0]),
                  delta * frame
                )
              ]
            }
          ]
        }
      }

      return newFilter
    },
    [addDelta, calculateDelta, columnType, startOfDelta]
  )

  if (chart.dataSelections.length !== 1) {
    return <div>Can only drive replay with single layer chart</div>
  }

  const availableAdvanceByUnits = isTimeType(columnType) ? allTimeBinUnits : []
  const defaultAdvanceByUnit =
    timeUnit && timeUnit !== "auto" ? timeUnit : DEFAULT_TIME_UNIT

  const dynamicFrameLength =
    !isTimeType(columnType) && !isNumericType(columnType)
      ? categoryData?.length
      : undefined

  // this should go into a hook or an effect or something
  const calculateFrames = ({
    filter: f,
    frames,
    // duration,
    advanceBy,
    advanceByUnits
  }) => {
    if (!advanceBy || !isTimeType(columnType) || !filter) {
      return frames
    } else {
      const [_, dynamicDiffDelta] = getDeltaFunctions(
        columnType,
        advanceByUnits
      )

      const dynamicDiff =
        dynamicDiffDelta(
          f[MULTISOURCE][AND][0][BETWEEN][1],
          f[MULTISOURCE][AND][0][BETWEEN][0],
          { roundingMethod: "ceil" }
        ) / advanceBy

      return dynamicDiff
    }
  }

  // current UI doesn't really have a non-time based concept. So disable it.
  if (!isTimeType(columnType)) {
    return <div>Can only drive replay with time type dimension</div>
  }

  return (
    <CrossFilterReplay
      chartId={chartId}
      chartAddonId={chartAddonId}
      filter={filter}
      userGeneratedFilter
      setCrossFilter={setCrossFilter}
      updateFilterAtFrame={updateFilterAtFrame}
      defaultFrames={dynamicFrameLength}
      availableAdvanceByUnits={availableAdvanceByUnits}
      defaultAdvanceByUnit={defaultAdvanceByUnit}
      calculateFrames={calculateFrames}
    />
  )
}

if (getFeatureFlag(ENABLE_CROSSFILTER_REPLAY)) {
  registerChartAddon({
    type: "VEGA_COMBO_CHART_ADDON_CROSSFILTER_REPLAY",
    label: "CrossFilter Replay",
    component: VegaComboCrossFilterReplay,
    icon: <CrossFilterReplayIcon />
  })
}
