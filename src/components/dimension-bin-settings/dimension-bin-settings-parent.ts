// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  setDcChartAxisDomain,
  setElasticX,
  setElasticY,
  updateSelector
} from "actions/charts-action-creators"
import {
  setIsBinned,
  setNumOfBins
} from "reducers/charts/helpers/dimension-object-helpers"
import {
  toggleBinning,
  updateBinExtent,
  updateNumBins
} from "charts/line/line-chart-action-creators"
import { connect } from "react-redux"
import DimensionBinSettings from "./dimension-bin-settings"
import { MS_IN_SECONDS } from "constants/magic-variables"
import { TIME_UNITS } from "constants/data-types"
import { mergeR } from "utils/ramda-helpers"
import { setChartSpecificBinFilters } from "vega/actions/filter-action-creators-crossfilter-interop"
import { CHART_TYPES, HEAT_DIMENSION_Y_AXIS_NAME } from "constants/charts"

export interface MappedProps {
  dimensions: any
}
function mapStateToProps({ charts }, { chartId }): MappedProps {
  return {
    dimensions: charts[chartId].dimensions
  }
}

export interface MappedDispatch {
  updateIsBinned: () => void
  updateBinSlider: (binNumber: number) => void
  updateBinRangeSlider: (value: number | [number, number]) => void
  onFocus: () => void
  onBlur: () => void
}

export function mapDispatchToProps(
  dispatch,
  { chartId, chartType, index, dimension, setPropagation }
): MappedDispatch {
  const { isBinned, type } = dimension
  async function updateDimension(updater) {
    return dispatch(updateSelector(chartId, "dimensions", index, updater))
  }

  function shouldNumberToDate(value) {
    return type in TIME_UNITS ? new Date(value * MS_IN_SECONDS) : value
  }

  return {
    async updateIsBinned() {
      if (chartType === "line") {
        await dispatch(toggleBinning(chartId))
      } else {
        await updateDimension(setIsBinned(!isBinned))
      }
      await dispatch(setChartSpecificBinFilters(chartId))
    },
    async updateBinSlider(value) {
      if (
        chartType === CHART_TYPES.LINE ||
        chartType === CHART_TYPES.HISTOGRAM
      ) {
        await dispatch(updateNumBins(chartId, value))
      } else {
        await updateDimension(setNumOfBins(value))
      }
      await dispatch(setChartSpecificBinFilters(chartId))
    },
    async updateBinRangeSlider(value) {
      if (
        chartType === CHART_TYPES.HEAT &&
        dimension.name === HEAT_DIMENSION_Y_AXIS_NAME
      ) {
        dispatch(setElasticY(chartId, false))
      } else {
        dispatch(setElasticX(chartId, false))
      }
      if (
        chartType === CHART_TYPES.LINE ||
        chartType === CHART_TYPES.HISTOGRAM
      ) {
        await dispatch(
          updateBinExtent(chartId, [
            shouldNumberToDate(value[0]),
            shouldNumberToDate(value[1])
          ])
        )
      } else {
        const lowVal = shouldNumberToDate(value[0])
        const highVal = shouldNumberToDate(value[1])
        await updateDimension(
          mergeR({
            currentLowValue: lowVal,
            currentHighValue: highVal,
            minMax: [lowVal, highVal],
            extentsSet: true
          })
        )
        if (chartType === CHART_TYPES.HEAT) {
          await dispatch(
            setDcChartAxisDomain(
              chartId,
              dimension.name === HEAT_DIMENSION_Y_AXIS_NAME ? "y" : "x",
              value
            )
          )
        }
      }
      await dispatch(setChartSpecificBinFilters(chartId))
    },
    onFocus: () => setPropagation(() => false),
    onBlur: () => setPropagation(() => true)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DimensionBinSettings)
