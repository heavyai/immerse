// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  NUMERICAL_AND_TIME_TYPES as BINABLE_TYPES,
  TIME_UNITS
} from "constants/data-types"

import {
  compose,
  identity,
  ifElse,
  inc,
  lensProp,
  over,
  values,
  assocPath
} from "ramda"

import {
  clearColorByDimension,
  maybeAddEmptySelector,
  maybeOffsetSorting,
  maybeSetDateFormatForTable,
  resetCustomColors,
  setChartNextColor,
  setCustomColorDomainAndRange,
  updateDimension
} from "./charts-reducer-helpers"

import { setChart } from "reducers/charts/charts-reducer-helpers"
import { restrictedDimensionTypeKey } from "./remove-selector-reducer"
import { computeRestricton } from "./charts-reducer"

const defaultBinParams = {
  max_val: null,
  min_val: null,
  maxBinSize: null,
  currentHighValue: null,
  currentLowValue: null,
  autobin: false,
  numOfBins: null,
  isBinned: false,
  isBinnable: false
}

const maybeAddMultiSeriesDimension = (chartId, index, dimension, chartType) =>
  ifElse(
    () => (chartType === "line" || chartType === "histogram") && index === 1,
    compose(
      over(
        lensProp(chartId),
        setCustomColorDomainAndRange(dimension.value, [], [])
      ),
      setChart(chartId, "colorByDimension", dimension.value)
    ),
    identity
  )

const maybeRestrictDimensionType = (chartId, dimension) => (state) => {
  const sources = values(state[chartId].multiSources || {})
  const currentType = state[chartId][restrictedDimensionTypeKey]
  if (sources.length > 0 && !currentType) {
    const type = computeRestricton(dimension.type)
    return assocPath([chartId, restrictedDimensionTypeKey], type)(state)
  }
  return state
}

export default function addDimensionReducer(
  state,
  { index, chartId, dimension, multiSourceIndex }
) {
  const chartType = state[chartId].type

  function createNewDimension(value) {
    if (BINABLE_TYPES[dimension.type] && chartType !== "geoheat") {
      let timeBin = dimension.type in TIME_UNITS ? "auto" : null
      if (value.extract && timeBin) {
        timeBin = value.timeBin
      }
      return Object.assign({}, value, dimension, {
        extract: !(dimension.type in TIME_UNITS) ? false : value.extract,
        inactive: false,
        // wait to set min_val and max_val, then loading should be changed to
        // false in update-selector-reducer.js
        loading: true,
        timeBin
      })
    } else {
      return Object.assign({}, value, dimension, defaultBinParams, {
        inactive: false
      })
    }
  }
  return compose(
    setChartNextColor(chartId, multiSourceIndex),
    maybeAddMultiSeriesDimension(chartId, index, dimension, chartType),
    maybeAddEmptySelector("dimensions", chartId, chartType, multiSourceIndex),
    maybeOffsetSorting(inc, index, "dimensions", chartId, state[chartId]),
    setChart(chartId, "colorDomain", null),
    resetCustomColors(chartId),
    clearColorByDimension(chartId),
    updateDimension(chartId, index, createNewDimension),
    maybeRestrictDimensionType(chartId, dimension),
    maybeSetDateFormatForTable(
      chartId,
      chartType,
      dimension,
      "dimensions",
      index
    )
  )(state)
}
