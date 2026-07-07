// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  AGG_TYPES,
  AGG_TYPES_WITHOUT_SAMPLE,
  GEO_POSITION_AGG_TYPES,
  GEO_RASTERIZE_AGG_TYPES
} from "constants/agg-types"
import { CHART_TYPES } from "constants/charts"
import { ALL_TYPES, isNonDictString } from "constants/data-types"
import compose from "recompose/compose"
import { connect } from "react-redux"
import MeasureAggTypeSelector from "./measure-aggtype-selector"
import { measureShape } from "constants/prop-types"
import PropTypes from "prop-types"
import { setAggType } from "reducers/charts/helpers/measure-object-helpers"
import setPropTypes from "recompose/setPropTypes"
import { updateLineMeasureAggType } from "charts/line/line-chart-action-creators"
import { updateSelector } from "actions/charts-action-creators"
import {
  isPositionMeasure,
  isRasterPointChart
} from "charts/raster-chart/raster-utils"
import { mergeR } from "utils/ramda-helpers"
import { isHardwareDistributed } from "utils/store-utils"

const propTypes = {
  measure: measureShape.isRequired,
  chartId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
}

function mapStateToProps({ charts }, { chartId }) {
  return {
    chartType: charts[chartId].type
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export function filterAggtypesOnMeasureType(measure, chartType) {
  let aggs = []
  if (
    (chartType === "pointmap" || chartType === "backendScatter") &&
    isPositionMeasure(measure)
  ) {
    aggs = GEO_POSITION_AGG_TYPES
  } else if (chartType === "backendChoropleth" && measure.name === "geo") {
    aggs = []
  } else if (ALL_TYPES[measure.type] && !isNonDictString(measure)) {
    if (chartType === "line" || chartType === "line2") {
      // Leave Sample out for line2 / combo chart because it currently causes issues due to the
      // mildly broken dynamic top N refresh Also line
      // chart, for a consistent experience between the two and fewer issues switching.
      aggs = AGG_TYPES_WITHOUT_SAMPLE
    } else if (chartType === CHART_TYPES.CONTOUR) {
      aggs = GEO_RASTERIZE_AGG_TYPES
    } else {
      aggs = AGG_TYPES
    }
  }

  if (isHardwareDistributed()) {
    aggs = aggs.filter((agg) => agg !== "Median")
  }
  return aggs
}

export function mergeProps(
  { chartType },
  { dispatch },
  { chartId, index, measure }
) {
  return {
    measure,
    updateAggType: (aggType) => () => {
      if (chartType === CHART_TYPES.LINE) {
        dispatch(updateLineMeasureAggType(chartId, aggType))
      } else {
        if (measure.name !== "postFilter") {
          dispatch(
            updateSelector(chartId, "measures", index, setAggType(aggType))
          )
        }
        if (chartType === CHART_TYPES.GEOHEAT) {
          dispatch({ type: "SET_GEOHEAT_MEASURE", chartId })
        } else if (
          isRasterPointChart(chartType) ||
          [
            CHART_TYPES.LINEMAP,
            CHART_TYPES.CONTOUR,
            CHART_TYPES.BACKEND_CHOROPLETH
          ].includes(chartType)
        ) {
          if (measure.name === "postFilter") {
            dispatch({
              type: "UPDATE_RASTER_CHART_POST_FILTER",
              chartId,
              index,
              setter: mergeR({
                loading: false,
                aggType
              }),
              selectorType: measure.name
            })
          } else {
            dispatch({
              type: "UPDATE_RASTER_CHART_MEASURE_AGG",
              index,
              chartId
            })
          }
        } else if (chartType === CHART_TYPES.BACKEND_CHOROPLETH) {
          dispatch({ type: "UPDATE_RASTER_CHART", chartId })
        }
      }
    },
    aggTypes: filterAggtypesOnMeasureType(measure, chartType)
  }
}

export default compose(
  setPropTypes(propTypes),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(MeasureAggTypeSelector)
