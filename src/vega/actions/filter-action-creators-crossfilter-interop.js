// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import pushid from "pushid"
import { cloneDeep } from "lodash"
import deepEquals from "fast-deep-equal"

import * as HeavyAIDraw from "import-shims/heavyai-draw"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { GEOJOIN_BOUNDING_BOXES } = available_feature_flags

import { comparableValue } from "utils/helpers"

import {
  setChartFilters,
  setRangeChartFilters
} from "actions/charts-filter-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { setChartZoom } from "actions/map-charts-filter-action-creators"
import { isRasterChart, isMultiLayer } from "charts/raster-chart/raster-utils"
import { CHART_TYPES, isNewChart } from "constants/charts"
import { isNumericType, isTimeType } from "constants/data-types"
import {
  getXAxisDimension,
  isChartMultiSource
} from "reducers/charts/helpers/multi-source-helpers"
import { postFilterNotification } from "services/external-messenger-api/api/registerForFilterNotifications"

import {
  andFilter,
  filterHasChild,
  filterHasChildren,
  multiSourceFilter,
  orFilter,
  buildFilterSql,
  createUnlikelyStmtFromShape
} from "vega/constants/filter-types"
import { doRedrawAll } from "./filter-action-creators"
import {
  buildRasterPolyFilters,
  getRasterDimensions
} from "./filter-action-creators-crossfilter-maps-interop"
import {
  hasBoundingBoxFilter,
  getChildFilters,
  formatCoordinate
} from "vega/utils/filter"

import { getSelectedFilterSet } from "components/new-filters/filter-sets-selectors.js"

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_NOT,
  FILTER_TYPE_SQL,
  FILTER_TYPE_AND
} from "vega/constants/filter-type-constants"

import {
  DELETE_FILTER_CROSSFILTER,
  DELETE_FILTER_CROSSFILTER_SUCCESS,
  SET_FILTER_CROSSFILTER,
  SET_FILTER_CROSSFILTER_SUCCESS,
  TOGGLE_FILTER_CROSSFILTER,
  TOGGLE_FILTER_CROSSFILTER_SUCCESS
} from "constants/action-types"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"
import { getTablesForDataSource } from "components/join-manager/utils"

const forceUserGenerated = {}

export const forceUserGeneratedFilter = (filterName, userGenerated) => {
  if (userGenerated === undefined) {
    delete forceUserGenerated[filterName]
  } else {
    forceUserGenerated[filterName] = userGenerated
  }
}

const chartsToIgnore = {}

/* I'm gonna note this up here as a TODO: the filter SQL is a lie.
   we don't need to provide any actual SQL anywhere...because we're using labels exclusively.
   and getting the filter strings outta crossfilter is problematic at best and crash prone at worst.
   SO just stuff some sort of valid SQL string into there and ignore it. It's never actually used anywhere
   anyway.
*/

function fixFilterDataSource(filter, dataSource, dataExpression) {
  if ("dataSource" in filter) {
    filter.dataSource = dataSource
  }

  // Assumption doesn't apply to joins, but we're not making 'em compatible with VDF.
  if ("table" in filter) {
    filter.table = dataSource
  }

  if (dataExpression && "dataExpression" in filter) {
    filter.dataExpression = dataExpression
  }
  if (filterHasChild(filter)) {
    fixFilterDataSource(filter.filter, dataSource, dataExpression)
  } else if (filterHasChildren(filter)) {
    filter.filters.forEach((f) =>
      fixFilterDataSource(f, dataSource, dataExpression)
    )
  }
  return filter
}

// Some old charts can happen to be saved in an odd state - extract on, but also
// "auto" binning. Normally, auto binning should only be a thing that actual
// binning can do, not extract. However, old charts did support this in some
// edge cases, and defaulted the extract unit to "isodow". Support that weird
// edge case here too.
function extractUnit(dimension) {
  return (
    dimension.extract &&
    (dimension.timeBin === "auto" ? "isodow" : dimension.timeBin)
  )
}

export function setFilterX(chartId, params = {}) {
  return async (dispatch, getState) => {
    if (chartsToIgnore[chartId] === true) {
      return
    }

    const charts = getState().charts
    const chart = charts[chartId]

    // if the chart doesn't actually exist, then we're done. Bomb out.
    if (chart === undefined) {
      return
    }
    // If this method happens to be called on a new chart, it shouldn't do anything.
    // This method is only meant for use on old charts
    if (isNewChart(chart.type)) {
      return
    }

    // Cross sections have a "filter" when panned/zoomed to change bounds, but
    // per current requirements, it shouldn't actually filter out any data.
    if (isCrossSectionType(chart.type)) {
      return
    }

    // Filters coming from the chart should never be points or polylines. Remove
    // them here so that logic after this proceeds correctly
    const givenFilters = params.filters || chart.filters
    let filters = [...givenFilters].filter(
      (f) =>
        f === null ||
        typeof f !== "object" ||
        (f.type !== "PolyLine" &&
          f.type !== "LatLonPolyLine" &&
          f.type !== "Point")
    )

    const rangeFilter = params.rangeFilter || chart.rangeFilter || []

    // we want the chart's dimensions, which we're gonna pull out here.
    let chartDimensions = [...(chart.dimensions || [])]

    // except for scatter. We need to look at its measures.
    // scatter is super fun.
    if (chart.type === "backendScatter") {
      // okay. We need to generate an AND of two between filters...one for each dimension.
      const xMeasure = chart.measures.find((m) => m.name === "x")
      const yMeasure = chart.measures.find((m) => m.name === "y")

      chartDimensions = [xMeasure, yMeasure]
    }

    const validDimensions = chartDimensions.filter((d) => d.value !== undefined)
    const numDimensions = validDimensions.length
    const selectedFilterSet = getSelectedFilterSet(getState())

    // there's an edge case - you can fire this off during delete of a filter set and before
    // the next filter set is selected. In that case, just do nothing.
    if (selectedFilterSet === undefined) {
      return
    }
    // needed to redraw linked sources
    let dataSources = isChartMultiSource(chart)
      ? Object.values(chart.multiSources).map(({ table }) => table)
      : [chart.dataSource]

    const tables = dataSources.map(getTablesForDataSource).flat()

    // each chart can have one crossfilter per filter set.
    const filter = getState().omnifilters.find(
      (f) =>
        f.chartId === chartId &&
        selectedFilterSet.filters.includes(f.name) &&
        f.appliesTo === "CROSSFILTER"
    )

    // the filter's name is :
    // 1) the name of the existing filter OR
    // 2) the given parameter name (used for tests _only_)
    // 3) generated by pushid()
    const filterName = (filter || {}).name || params.filterName || pushid()

    // special cases! Fun! if the filter is disabled, we need to do a few things.
    if (filter && filter.enabled === false && filters.length) {
      // first we nuke the current omnifilter
      await dispatch({
        type: DELETE_FILTER_CROSSFILTER,
        payload: { chartId, name: filter.name }
      })

      // next we create a new set of filters for the chart, a combination of the old + the new
      const updatedFilters = filter.chartFilters.filter(
        (f) => !filters.includes(f)
      )
      updatedFilters.push(...filters)
      await dispatch(setChartFilters(chartId, updatedFilters))

      // redraw linked data sources
      await doRedrawAll(dispatch, getState, new Set(tables), {
        onlyLinked: true
      })

      // and finally, if we have any external listeners, notify them.
      postFilterNotification()

      dispatch({ type: SET_FILTER_CROSSFILTER_SUCCESS, group: tables })

      // and we're done. the setChartFilters call up above there properly nuked it.
      return
    }

    // and if we have a filter and it's not enabled and we're setting filters to nothing...then do nothing.
    // unless, of course, it's a raster chart. Then we may want to hang around and update the mapZoomCenter
    if (
      filter &&
      filter.enabled === false &&
      filters.length === 0 &&
      rangeFilter.length === 0 &&
      params.mapZoomCenter === undefined
    ) {
      return
    }
    // if we've made it to here and have no filters, just delete it and bomb out.
    // rasters are, of course, a special case. And we need to keep going to add back in the bounding box.
    // and, naturally, scatter charts are raster charts but they do not have a mapZoomCenter containing the
    // bounding box, so those don't count.
    if (
      filters.length === 0 &&
      rangeFilter.length === 0 &&
      (!isRasterChart(chart.type) || chart.type === "backendScatter")
    ) {
      await dispatch({
        type: DELETE_FILTER_CROSSFILTER,
        payload: { chartId, name: filterName }
      })

      // redraw tables
      await doRedrawAll(dispatch, getState, new Set(tables))

      dispatch({ type: SET_FILTER_CROSSFILTER_SUCCESS, group: tables })

      // and finally, if we have any external listeners, notify them.
      postFilterNotification()

      return
    }

    const commonFilter = {
      filterType: FILTER_TYPE_SQL,
      dataSource: chart.dataSource
    }

    const dimension = chartDimensions.find((d) => d.value !== undefined)

    const measure = chart.measures.find((d) => d.value !== undefined)

    const dataExpressionSource = dimension || measure

    if (dataExpressionSource?.custom) {
      // Table isn't stored on non-shared custom selectors. This obviously isn't
      // gonna cut it for multilayer charts, but we're not grabbing table from
      // here for those anyway.
      dataExpressionSource.table = chart.dataSource
    }

    const lassoFilters = []

    let filterObjs = filters
      .map((f) => {
        if (f === null) {
          return {
            ...commonFilter,
            filterType: FILTER_TYPE_ISNULL,
            dataExpression: dataExpressionSource.value,
            dataType: dataExpressionSource.type,
            dataTypeIsArray: dataExpressionSource.is_array,
            label: `${dataExpressionSource.value} is null`,
            table: dataExpressionSource.table
          }
        } else if (Array.isArray(f)) {
          // table chart. Awesome.
          // if it's a table chart w/o dimensions, then we assume it's an array of values for each column in the table.
          // this'll probably blow up if you change the columns.
          if (
            chart.type === "table" &&
            !chart.dimensions.some((d) => d.value !== undefined)
          ) {
            // we don't properly handle inverse filters in this case. So we explicitly make them non-inverse.
            // this should be re-visited.
            params.areFiltersInverse = false

            const builtFilters = []
            f.forEach((value, i) => {
              if (value === undefined) {
                return
              }
              const col = chart.measures[i]
              if (value === null) {
                builtFilters.push({
                  ...commonFilter,
                  table: col.table,
                  filterType: FILTER_TYPE_ISNULL,
                  dataExpression: col.value,
                  dataType: col.type,
                  dataTypeIsArray: col.is_array,
                  label: `${col.value} is null`
                })
              } else {
                builtFilters.push({
                  ...commonFilter,
                  table: col.table,
                  filterType: FILTER_TYPE_SIMPLE,
                  dataExpression: col.value,
                  dataType: col.type,
                  dataTypeIsArray: col.is_array,
                  operator: "=",
                  value,
                  extract: extractUnit(col)
                })
              }
            })

            return andFilter(builtFilters)
          }
          // if we only have one dimension OR it's a histogram OR a line2 (both brush filters)
          // then we can do a between.
          else if (
            chart.type === "histogram" ||
            chart.type === "line2" ||
            numDimensions === 1
          ) {
            return {
              ...commonFilter,
              filterType: FILTER_TYPE_BETWEEN,
              isRelative: false,
              table: dataExpressionSource.table,
              dataExpression: dataExpressionSource.value,
              dataType: dataExpressionSource.type,
              start: f[0],
              end: f[1],
              extract: extractUnit(dataExpressionSource)
            }
          } else {
            // and destructively iterate over our filters
            const localFilters = [...f]
            const builtFilters = []

            chartDimensions.forEach((d) => {
              // skip over those dimensions w/o values
              if (d.value === undefined) {
                return
              }
              const value = localFilters.shift()
              if (Array.isArray(value)) {
                builtFilters.push({
                  ...commonFilter,
                  table: d.table,
                  filterType: FILTER_TYPE_BETWEEN,
                  isRelative: false,
                  dataExpression: d.value,
                  dataType: d.type,
                  start: value[0],
                  end: value[1],
                  extract: extractUnit(d)
                })
              } else if (value === null) {
                builtFilters.push({
                  ...commonFilter,
                  table: d.table,
                  filterType: FILTER_TYPE_ISNULL,
                  dataExpression: d.value,
                  dataType: d.type,
                  dataTypeIsArray: d.is_array,
                  label: `${d.value} is null`
                })
              } else {
                builtFilters.push({
                  ...commonFilter,
                  filterType: FILTER_TYPE_SIMPLE,
                  table: d.table,
                  dataExpression: d.value,
                  dataType: d.type,
                  dataTypeIsArray: d.is_array,
                  operator: "=",
                  value,
                  extract: extractUnit(d)
                })
              }
            })

            return andFilter(builtFilters)
          }
          // TODO : SPECIAL IMPORTANT NOTE - PolyLine and Point filters are not supported. And I mean -anywhere-.
          // Not here, not in filter-types, not as an omnifilter, nothing. It's sorta fine? Since it doesn't make
          // sense as a filter, but they exist anyway. They should be dealt with. For now, we filter out undefined
          // and null at the end of the filterObjs = map.
        } else if (
          typeof f === "object" &&
          Object.prototype.toString.call(f) !== "[object Date]"
        ) {
          // this is going to be some sort of a lasso on a map. Save it for later.
          if (f.type !== "Circle") {
            lassoFilters.push(f)
            return null
          }

          // backendScatter plots have Circle filters, which are slightly different from LatLonCircles
          // for now, we're not going to create a DISTANCE filter, we're going to create straight SQL until
          // it properly populates the query
          /*
            return {
              ...commonFilter,
              filterType : FILTER_TYPE_DISTANCE,
              dataExpression: dataExpressionSource.value,
              point: f.position,
              originalPosition: f.position,
              ...rasterDim,
              radius: f.radius,
              distanceInMeters: f.radius
            } */

          // we're cheating for now and eliminating Circle filters and replacing 'em with SQL filters.
          const xMeasure = chartDimensions[0].value
          const yMeasure = chartDimensions[1].value
          const newShape = new HeavyAIDraw.Circle(f)
          const radsqr = Math.pow(newShape.radius, 2)
          const mat = HeavyAIDraw.Mat2d.clone(newShape.globalXform)
          HeavyAIDraw.Mat2d.invert(mat, mat)
          const sqlArray = [
            `${xMeasure} is not null`,
            `${yMeasure} is not null`
          ]
          sqlArray.push(
            `${createUnlikelyStmtFromShape(
              newShape.aabox,
              xMeasure,
              yMeasure,
              false
            )} AND (POWER(${mat[0]} * CAST(${xMeasure} AS FLOAT) + ${
              mat[2]
            } * CAST(${yMeasure} AS FLOAT) + ${mat[4]}, 2.0) + POWER(${
              mat[1]
            } * CAST(${xMeasure} AS FLOAT) + ${
              mat[3]
            } * CAST(${yMeasure} AS FLOAT) + ${
              mat[5]
            }, 2.0)) / ${radsqr} <= 1.0`
          )

          return {
            ...commonFilter,
            // TODO: Not ideal... but we have to choose one here
            table: xMeasure.table,
            filterType: FILTER_TYPE_SQL,
            sql: sqlArray.join(" AND ")
          }
        } else {
          // choropleth is a special case, even more so than originally thought.
          // We don't want to deal with choropleth here, since its filters get spread out to all layers.
          // so if we've reached this point it means we have a simple filter. check for any choropleth layers,
          // and if we have them then just bail out. We'll handle those later.

          const numChoropleths =
            chart.layers &&
            chart.layers.reduce((num, layer) => {
              return layer.type === "backendChoropleth" ? num + 1 : num
            }, 0)

          if (numChoropleths >= 1) {
            return null
          }

          const dataExpression = dataExpressionSource.value
          const { type, is_array, table } = dataExpressionSource
          return {
            ...commonFilter,
            table,
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression,
            dataType: type,
            dataTypeIsArray: is_array,
            operator: "=",
            value: f,
            extract: extractUnit(dataExpressionSource)
          }
        }
      })
      .filter((f) => f !== undefined && f !== null)

    // we're going to construct a special minimal bounding box to encompass just the lassos.
    // we can then later hand that into buildBoundingBox to construct one that's properly constrained
    // and minmal to the box and the lassos
    let lassoBoundingBox = undefined

    // next step is to build the lasso filters.
    if (lassoFilters.length) {
      const res = buildRasterPolyFilters({
        lassoFilters,
        chartId,
        chart,
        getState,
        chartDimensions
      })

      lassoBoundingBox = res.boundingBox

      filterObjs.push(...res.filterObjs)
      filters = filters.filter(
        (f) =>
          f.type !== "LatLonPoly" &&
          f.type !== "Poly" &&
          f.type !== "LatLonCircle"
      )
      filters.push(...res.chartFilters)
    }

    const choroplethLayersWithoutBoundingBoxes = new Set()

    // now we're gonna handle all of choropleth. Choropleth sticks its simple filters into the individual layers.
    // TODO: Any work to be done here for join datasources? Yes, figure it out later.
    if (
      chart.layers?.[0]?.dataSource &&
      chart.layers[0].measures.some((m) => m.value !== undefined)
    ) {
      chart.layers
        .filter(
          (layer) =>
            layer.filters?.length &&
            layer.measures.some((m) => m.value !== undefined) &&
            (layer.type === "choropleth" || layer.type === "backendChoropleth")
        )
        .forEach((layer) => {
          choroplethLayersWithoutBoundingBoxes.add(layer)

          const isGeoJoin = layer.geoJoin && layer.geoJoin.table

          const searchSpot = isGeoJoin ? layer.dimensions : layer.measures

          const { table, type, value } = searchSpot.find(
            (m) => m.value !== undefined
          )

          const dataExpression = isGeoJoin ? value : `${table}.rowid`
          layer.filters.forEach((f) =>
            filterObjs.push({
              ...commonFilter,
              table,
              dataSource: layer.dataSource,
              filterType: FILTER_TYPE_SIMPLE,
              dataExpression,
              dataType: type,
              dataTypeIsArray: false,
              operator: "=",
              value: f
            })
          )
        })
    }
    // TODO this section can be removed once we update the layer object when a layer is first initiated
    // right now, when we create a new raster layer, we don't update the layer object selectors.
    // We only update chart level selectors. Thus, the first layer datasource, dimensions, and measures
    // are not populated until we add another layer or click on Apply
    else if (
      [CHART_TYPES.BACKEND_CHOROPLETH, CHART_TYPES.CHOROPLETH].includes(
        chart.type
      )
    ) {
      const isGeoJoin =
        chart.geoJoin?.table || (chart.type === "choropleth" && chart.geoJson)

      const searchSpot = isGeoJoin ? chart.dimensions : chart.measures

      const { table, type, value } = searchSpot.find(
        (m) => m.value !== undefined
      )

      // if a BE choropleth layer has a poly selected, we do NOT add a bounding box for it.
      // FE choropleth is unaffected anyway, since there are no labels nor bounding boxes
      if (chart.layers?.[0]?.filters?.length) {
        choroplethLayersWithoutBoundingBoxes.add(chart.layers[0])
      }

      const dataExpression = isGeoJoin ? value : `${table}.rowid`
      // Single layer Choropleth chart's source of truth for poly selection filter is layer.filters
      // NOTE: We have a flow that setFilterX builds the filter before the filter is getting updated
      // in redux state for the chart/layer. However, we have a special case for Choropleth that
      // ignores the filter passed via param (line 435: if (numChoropleths >= 1) { return null })
      // and try to retrieve it from the redux state. Thus, for Choropleth case, the filter needs to be saved before
      // we reach here. If we update the chart.filters before this called, that would break the other shape filters for
      // other raster charts, so using the layer.filters as a source of truth works for Choropleth
      //
      // of course, there's an exception - BE choropleth has layers and we look to them, FE choropleth has 'em on the chart.
      const polyFilters = chart.layers?.[0]?.filters ?? filters
      if (polyFilters?.length) {
        polyFilters.forEach((f) =>
          filterObjs.push({
            ...commonFilter,
            table,
            dataSource: table,
            filterType: FILTER_TYPE_SIMPLE,
            dataExpression,
            dataType: type,
            dataTypeIsArray: false,
            operator: "=",
            value: f
          })
        )
      }
    }

    if (chart.type === "backendScatter") {
      // backendScatter is bananas with its special case bounding box.
      // so. Find the bounding box. Oh, did you think it was a bounding box filter? Of course not, it's an AND
      // of the x and y dimensions in a between.
      const boundingBox = filterObjs.find(
        (f) => f.filterType === FILTER_TYPE_AND
      )
      if (boundingBox) {
        // and then get all the other filters (which are the polys)
        const otherFilters = filterObjs.filter((f) => f !== boundingBox)
        // now we want to build an or filter of everything else then and it with the bounding box.
        // if there's nothing else, then just use the bounding box.
        const finalFilter = otherFilters.length
          ? andFilter([boundingBox, orFilter(otherFilters)])
          : boundingBox

        // finally, nuke the filters
        filterObjs = [finalFilter]
      }
    }

    // invert the filters, if necessary
    filterObjs = filterObjs.map((f) => {
      // not inverted? Keep it as is
      if (!params.areFiltersInverse) {
        return f
      } else {
        // otherwise, we negate the filter
        const negatedFilter = { filterType: FILTER_TYPE_NOT, filter: f }
        // if it's an ISNULL, then just return the negated version.
        if (f.filterType === FILTER_TYPE_ISNULL) {
          return negatedFilter
          // otherwise, if it's anything else, then we need to OR it with an ISNULL
        } else {
          const unjoinedNullFilters = []
          const childFilters = getChildFilters(f)
          childFilters.forEach((c) =>
            unjoinedNullFilters.push({
              filterType: FILTER_TYPE_ISNULL,
              dataExpression: c.dataExpression,
              dataType: c.dataType,
              dataTypeIsArray: c.is_array,
              extract: c.extract,
              dataSource: c.dataSource,
              table: c.table
            })
          )
          const nullFilter =
            unjoinedNullFilters.length === 1
              ? unjoinedNullFilters[0]
              : andFilter(unjoinedNullFilters)
          return orFilter([
            { filterType: FILTER_TYPE_NOT, filter: f },
            nullFilter
          ])
        }
      }
    })

    // sweet. We've made it to here. Ever marching forward!
    // add on boundingBoxFilters for every layer. Except choropleth, which handles them itself.
    const mapZoomCenter = params.mapZoomCenter || chart.mapZoomCenter
    if (chart.layers) {
      const filtersByDataSource = {}
      chart.layers.forEach((layer, layerId) => {
        tables.forEach((table) => {
          // We create a bounding box filter for every table within the join
          const bboxCommon = {
            ...commonFilter,
            table
          }
          const boundingBox = buildBoundingBoxFilter({
            bboxCommon,
            chart,
            chartDimensions,
            layer,
            mapZoomCenter,
            layerId,
            lassoBoundingBox
          })

          if (!boundingBox) {
            return
          }
          if (!choroplethLayersWithoutBoundingBoxes.has(layer)) {
            filterObjs.push(boundingBox)
          }

          // and now for the magic extra case. If we're adding a bounding box to the layer, then we
          // know that there's nothing else we have associated with it.
          //
          // which means that if it's a geoJoin layer that we're not going to be vending out any other
          // bounds information on the fact table (not the geo table). So we can create an additional
          // filter for the geotable based upon the bounds.
          //
          // Oh! And of course the geoJoin field is spread across all layers, so we need to see if there's a REAL geojoin
          // by looking to see if there's a geo column on the layer.
          if (getFeatureFlag(GEOJOIN_BOUNDING_BOXES)) {
            const layerGeoMeasure = layer?.measures?.find?.(
              (m) => m.name === "geo" && m.value !== undefined
            )

            if (layerGeoMeasure && layer.geoJoin?.table) {
              const factTable = layer.dimensions[0].table
              const factColumn = layer.dimensions[0].value
              const geoFilter = buildFilterSql([boundingBox])[0]
              const geoJoinSqlFilterObj = {
                filterType: FILTER_TYPE_SQL,
                dataSource: factTable,
                table: factTable,
                sql: `${factTable}.${factColumn} in (SELECT ${layer.geoJoin.table}.${layer.geoJoin.column} from ${layer.geoJoin.table} WHERE ${geoFilter})`,
                layerId,
                geojoinBoundingBox: true
              }

              if (filtersByDataSource[factTable] === undefined) {
                filtersByDataSource[factTable] = []
                filtersByDataSource[factTable].push(geoJoinSqlFilterObj)
              }
            }
          }
        })
      })

      // next, we've gotta peel everything apart by data source
      while (filterObjs.length) {
        // yank off the filterObj
        const filterObj = filterObjs.pop()
        const { dataSource } = filterObj

        if (filtersByDataSource[dataSource] === undefined) {
          filtersByDataSource[dataSource] = []
        }
        filtersByDataSource[dataSource].push(filterObj)
      }

      dataSources = Object.keys(filtersByDataSource)
      const constructedSubFilters = {}

      dataSources.forEach((ds) => {
        const boundingBoxes = filtersByDataSource[ds].filter(
          (f) => f.filterType === FILTER_TYPE_BOUNDING_BOX
        )
        const lassos = filtersByDataSource[ds].filter(
          (f) => f.filterType !== FILTER_TYPE_BOUNDING_BOX
        )

        const bboxFilter =
          boundingBoxes.length > 1 ? andFilter(boundingBoxes) : boundingBoxes[0]

        const geoFilter = lassos.find((f) => f.geojoinBoundingBox)

        let lassoFilter = undefined
        if (lassos.length) {
          if (lassos.length === 1) {
            lassoFilter = lassos[0]
          } else if (geoFilter) {
            const nonGeoFilters = lassos.filter((f) => !f.geojoinBoundingBox)
            lassoFilter = nonGeoFilters.length
              ? andFilter([geoFilter, orFilter(nonGeoFilters)])
              : geoFilter
          } else {
            lassoFilter = orFilter(lassos)
          }
        }

        const compositeFilters = [bboxFilter, lassoFilter].filter(
          (f) => f !== undefined
        )

        constructedSubFilters[ds] =
          compositeFilters.length > 1
            ? andFilter(compositeFilters)
            : compositeFilters[0]
      })

      if (dataSources.length === 1) {
        filterObjs.push(constructedSubFilters[dataSources[0]])
      } else {
        filterObjs.push(multiSourceFilter(constructedSubFilters))
      }
    }

    // okay. Were we expecting a multi-layer chart but then we didn't get one? Then it's
    // an old raster chart. Build a bounding box from the chart data itself.
    if (isMultiLayer(chart.type) && !chart.layers) {
      const boundingBox = buildBoundingBoxFilter({
        commonFilter,
        chart,
        chartDimensions,
        mapZoomCenter,
        lassoBoundingBox
      })
      if (boundingBox) {
        if (filterObjs.length) {
          const lassoFilter = orFilter(filterObjs)
          filterObjs = []
          filterObjs.push(andFilter([boundingBox, lassoFilter]))
        } else {
          filterObjs.push(boundingBox)
        }
      }
    }

    let isRangeFilter = false
    if (filters.length === 0 && rangeFilter.length !== 0) {
      const rangeFilterObjs = rangeFilter.map((f) => ({
        ...commonFilter,
        table: dimension.table,
        dataSource: chart.dataSource,
        filterType: FILTER_TYPE_BETWEEN,
        isRelative: false,
        dataExpression: dimension.value,
        dataType: dimension.type,
        start: f[0],
        end: f[1]
      }))

      filterObjs.push(...rangeFilterObjs)
      isRangeFilter = true
    }

    const filterLogicalOperator = params.areFiltersInverse
      ? andFilter
      : orFilter

    let constructedFilter =
      filterObjs.length > 1 ? filterLogicalOperator(filterObjs) : filterObjs[0]

    // we may not have successfully constructed a filter, so only do the next things if we did
    if (constructedFilter) {
      // by default, we use the chart's dataSource unless it's VDF, in which case
      // we need to look at the multiSources.
      let dataExpressionByDataSource = { [chart.dataSource]: dimension }
      if (chart.multiSources && Object.keys(chart.multiSources).length > 0) {
        dataExpressionByDataSource = {}
        dataSources = Object.entries(chart.multiSources).map(([idx, ds]) => {
          const dim = getXAxisDimension(chartDimensions, idx)
          if (dim) {
            dataExpressionByDataSource[ds.table] = dim.value
          }
          return ds.table
        })

        // if we have multiple datasources, we need to convert to a MultiSourceFilter
        if (dataSources.length > 1) {
          constructedFilter = multiSourceFilter(
            Object.fromEntries(
              dataSources.map((ds) => {
                return [
                  ds,
                  fixFilterDataSource(
                    cloneDeep(constructedFilter),
                    ds,
                    dataExpressionByDataSource[ds]
                  )
                ]
              })
            )
          )
        }
      }

      const newFilter = {
        chartId,
        appliesTo: "CROSSFILTER",
        name: filterName,
        enabled: true,
        dataSources,
        filter: constructedFilter,
        chartFilters: filters,
        chartRangeFilter: rangeFilter,
        mapZoomCenter: params.mapZoomCenter || chart.mapZoomCenter,
        isRangeFilter,
        isOldFilter: true,
        areFiltersInverse: params.areFiltersInverse,
        userGenerated:
          forceUserGenerated[filterName] ?? params.userGenerated ?? false
      }

      // look to see if the filter has changed, and if it hasn't, then don't bother doing anything else.
      if (!matchingFilters(filter, newFilter)) {
        const dataSourceTables = dataSources.map(getTablesForDataSource).flat()
        dispatch(updateDashboardSaveState())
        await dispatch({ type: SET_FILTER_CROSSFILTER, payload: newFilter })

        // redraw linked data sources
        await doRedrawAll(dispatch, getState, new Set(dataSourceTables))
        dispatch({
          type: SET_FILTER_CROSSFILTER_SUCCESS,
          group: dataSourceTables
        })

        // and finally, if we have any external listeners, notify them.
        postFilterNotification()
      }
    } // end if constructedFilter
  }
}

function matchingFilters(a = {}, b = {}) {
  return deepEquals(
    {
      enabled: a.enabled,
      dataSources: a.dataSources,
      filter: a.filter,
      areFiltersInverse: a.areFiltersInverse,
      isRangeFilter: a.isRangeFilter
    },
    {
      enabled: b.enabled,
      dataSources: b.dataSources,
      filter: b.filter,
      areFiltersInverse: b.areFiltersInverse,
      isRangeFilter: b.isRangeFilter
    }
  )
}

export function updateFilterX(newFilter, name) {
  return async (dispatch, getState) => {
    const filter = getState().omnifilters.find((f) => f.name === name)

    // okay, first confirm that we have the filter and it's not an artifact.
    if (filter) {
      const chartId = filter.chartId
      const updatedFilter = []
      const areFiltersInverse = filter.areFiltersInverse
      if (newFilter.filterType === FILTER_TYPE_SIMPLE) {
        if (isNumericType(newFilter.dataType)) {
          const parsedValue = parseFloat(newFilter.value)
          if (parsedValue !== undefined && !isNaN(parsedValue)) {
            updatedFilter.push(parsedValue)
          }
        } else if (newFilter.value.length) {
          updatedFilter.push(newFilter.value)
        }
      } else if (newFilter.filterType === FILTER_TYPE_NOT) {
        updatedFilter.push(newFilter.filter.value)
      } else if (newFilter.filterType === FILTER_TYPE_BETWEEN) {
        if (
          isNumericType(newFilter.dataType) ||
          (isTimeType(newFilter.dataType) && newFilter.extract)
        ) {
          const parsedStart = parseFloat(newFilter.start)
          const parsedEnd = parseFloat(newFilter.end)

          if (
            parsedStart !== undefined &&
            !isNaN(parsedStart) &&
            parsedEnd !== undefined &&
            !isNaN(parsedEnd)
          ) {
            updatedFilter.push([parsedStart, parsedEnd])
          }
        } else if (
          newFilter.start !== undefined &&
          newFilter.start !== null &&
          newFilter.end !== undefined &&
          newFilter.end !== null
        ) {
          updatedFilter.push([newFilter.start, newFilter.end])
        }
      }

      if (filter.isRangeFilter) {
        await dispatch(setRangeChartFilters(chartId, updatedFilter))
      } else {
        await dispatch(
          setChartFilters(chartId, updatedFilter, areFiltersInverse)
        )
      }
    }
  }
}

export function deleteFilterX(name) {
  return async (dispatch, getState) => {
    const filter = getState().omnifilters.find((f) => f.name === name)
    const selectedFilterSet = getSelectedFilterSet(getState())

    if (filter) {
      const chartId = filter.chartId
      await dispatch({
        type: DELETE_FILTER_CROSSFILTER,
        payload: { chartId, name }
      })

      dispatch(updateDashboardSaveState())
      const tables = filter.dataSources.map(getTablesForDataSource).flat()

      // Only modify/redraw chart if the filter exists on the current filter set--
      // deleting an inactive filter set shouldn't have any effect on the chart.
      if (selectedFilterSet.filters.includes(name)) {
        await dispatch(setChartFilters(chartId))

        // redraw linked data sources
        await doRedrawAll(dispatch, getState, new Set(tables), {
          onlyLinked: true
        })
      }

      dispatch({
        type: DELETE_FILTER_CROSSFILTER_SUCCESS,
        group: tables
      })

      // and finally, if we have any external listeners, notify them.
      postFilterNotification()
    }
  }
}

export function toggleFilterX(name, enabled, recenter = false) {
  return async (dispatch, getState, services) => {
    const filterMetadata = getState().omnifilters.find((f) => f.name === name)
    if (filterMetadata) {
      const chartId = filterMetadata.chartId
      const newVal = enabled !== undefined ? enabled : !filterMetadata.enabled

      await dispatch({
        type: TOGGLE_FILTER_CROSSFILTER,
        payload: { name, enabled: newVal }
      })

      chartsToIgnore[chartId] = true
      const chart = getState().charts[chartId]

      // fine. There's another case -
      // if it's a raster chart, ti'll have a bounding box. But this may not necessarily be
      // a bounding box filter (it could be a selection or lasso or whatever). The user
      // may not want to enable the filter (because it was disabled), but they may want to
      // recenter onto the bounding box. This happens when the user changes filter sets, and so far
      // no place else.
      if (
        recenter &&
        !hasBoundingBoxFilter(filterMetadata) &&
        isRasterChart(chart.type)
      ) {
        await dispatch(setChartZoom(chartId, filterMetadata.mapZoomCenter))
      }

      if (hasBoundingBoxFilter(filterMetadata)) {
        // Fun. Raster charts are the only things with bounding box filters. So we know
        // there's a dcChart backing it. Snag it, pull out the crossfilter, and then call the old
        // toggleFilter on it.
        const dcChart = services.get("dc").getChart(chart.dcFlag)

        if (dcChart) {
          if (newVal === true) {
            await dispatch(setChartZoom(chartId, filterMetadata.mapZoomCenter))
          } else {
            await dispatch(setChartZoom(chartId))
          }

          await dcChart.redrawGroup()
        }
      }
      if (newVal === true) {
        const areFiltersInverse = filterMetadata.areFiltersInverse
        await dispatch(
          setChartFilters(
            chartId,
            filterMetadata.chartFilters,
            areFiltersInverse
          )
        )
      } else {
        await dispatch(setChartFilters(chartId))
      }
      chartsToIgnore[chartId] = false
    }

    dispatch(updateDashboardSaveState())

    dispatch({
      type: TOGGLE_FILTER_CROSSFILTER_SUCCESS,
      group: filterMetadata.dataSources
    })
  }
}

export function buildBoundingBoxFilter({
  commonFilter,
  chart,
  chartDimensions,
  layer,
  mapZoomCenter,
  layerId,
  lassoBoundingBox
}) {
  const rasterFilter = getRasterDimensions({
    chart,
    chartDimensions,
    layer
  })

  if (!mapZoomCenter || !rasterFilter) {
    return undefined
  }

  const boundingBox = {
    lonMin: mapZoomCenter.bounds.lonMin,
    lonMax: mapZoomCenter.bounds.lonMax,
    latMin: mapZoomCenter.bounds.latMin,
    latMax: mapZoomCenter.bounds.latMax
  }

  // if we were given a lasso bounding box, then intersect the two boxes.
  // if the lasso's box is within the map bounding box, we should use the lasso box so we don't change.
  // if the lasso's box is outside the map bounding box, we should use the map bounding box, because we're
  // restricting our view area.
  if (lassoBoundingBox) {
    const overlappingLassos = lassoBoundingBox.lassoBoxes.reduce(
      (overlap, bbox) => overlap || overlappingRects(bbox, boundingBox),
      false
    )
    if (overlappingLassos) {
      boundingBox.lonMin = Math.max(
        boundingBox.lonMin,
        formatCoordinate(lassoBoundingBox.lonMin)
      )
      boundingBox.lonMax = Math.min(
        boundingBox.lonMax,
        formatCoordinate(lassoBoundingBox.lonMax)
      )
      boundingBox.latMin = Math.max(
        boundingBox.latMin,
        formatCoordinate(lassoBoundingBox.latMin)
      )
      boundingBox.latMax = Math.min(
        boundingBox.latMax,
        formatCoordinate(lassoBoundingBox.latMax)
      )
    } else {
      // if we're here, then there are no lassos visible on screen - so we just construct a known
      // fake bounding box. It's just 10 degrees square, 10 degrees SW of the mimimum coordinate.
      // it's also totally arbitrary. It's just something outside of range.
      boundingBox.lonMin = Math.max(Math.floor(lassoBoundingBox.lonMin) - 20)
      boundingBox.lonMax = Math.min(Math.floor(lassoBoundingBox.lonMin) - 10)
      boundingBox.latMin = Math.max(Math.floor(lassoBoundingBox.latMin) - 20)
      boundingBox.latMax = Math.min(Math.floor(lassoBoundingBox.latMin) - 10)
    }
  }

  return {
    ...rasterFilter,
    ...commonFilter,
    filterType: FILTER_TYPE_BOUNDING_BOX,
    lonMin: formatCoordinate(boundingBox.lonMin),
    lonMax: formatCoordinate(boundingBox.lonMax),
    latMin: formatCoordinate(boundingBox.latMin),
    latMax: formatCoordinate(boundingBox.latMax),
    layerId
  }
}

function overlappingRects(bbox1, bbox2) {
  const l1 = { x: bbox1.lonMin, y: bbox1.latMax }
  const r1 = { x: bbox1.lonMax, y: bbox1.latMin }
  const l2 = { x: bbox2.lonMin, y: bbox2.latMax }
  const r2 = { x: bbox2.lonMax, y: bbox2.latMin }

  if (l1.x >= r2.x || l2.x >= r1.x) {
    return false
  }

  if (l1.y <= r2.y || l2.y <= r1.y) {
    return false
  }

  return true
}

export function deleteChartSpecificBinFilters(chartId) {
  return async (dispatch, getState) => {
    const charts = getState().charts
    const chart = charts[chartId]

    // if the chart doesn't actually exist, then we're done. Bomb out.
    if (chart === undefined) {
      return
    }

    // If this method happens to be called on a new chart, it shouldn't do anything.
    // This method is only meant for use on old charts
    if (isNewChart(chart.type)) {
      return
    }

    const selectedFilterSet = getSelectedFilterSet(getState())

    const chartFilter = getState().omnifilters.find(
      (f) =>
        f.chartId === chartId &&
        selectedFilterSet.filters.includes(f.name) &&
        f.appliesTo === "CHART" &&
        f.isOldFilter
    )
    if (chartFilter) {
      await dispatch({
        type: DELETE_FILTER_CROSSFILTER,
        payload: { chartId, name: chartFilter.name }
      })
    }
  }
}

export function setChartSpecificBinFilters(chartId) {
  return async (dispatch, getState) => {
    const charts = getState().charts
    const chart = charts[chartId]

    // if the chart doesn't actually exist, then we're done. Bomb out.
    if (chart === undefined) {
      return
    }

    // If this method happens to be called on a new chart, it shouldn't do anything.
    // This method is only meant for use on old charts
    //
    // Added Heatmap as an exception here to keep "ghost" omnifilters from being
    // added to dimensions, preventing axis "unlocking" after page reload.
    if (isNewChart(chart.type) || chart.type === CHART_TYPES.HEAT) {
      return
    }

    const selectedFilterSet = getSelectedFilterSet(getState())

    // there's an edge case - you can fire this off during delete of a filter set and before
    // the next filter set is selected. In that case, just do nothing.
    if (selectedFilterSet === undefined) {
      return
    }

    // Fine. We ~also~ need to create/store/update bin parameter filters, which are chart specific.
    // each chart can have one chart specific filter per filter set.
    const chartFilter = getState().omnifilters.find(
      (f) =>
        f.chartId === chartId &&
        selectedFilterSet.filters.includes(f.name) &&
        f.appliesTo === "CHART" &&
        f.isOldFilter
    )

    // the filter's name is :
    // 1) the name of the existing filter OR
    // 2) the given parameter name (used for tests _only_)
    // 3) generated by pushid()
    const chartFilterName = (chartFilter || {}).name || pushid()

    const chartFiltersByDimension = {}

    chart.dimensions.forEach((d) => {
      if (
        d.isBinned &&
        !d.extract &&
        !chart.elasticX &&
        // currentLowValue / currentHighValue can occasionally be null by
        // mistake, which will make this function think that we need to generate
        // a chart-specific binning filter
        d.currentLowValue !== null &&
        d.currentHighValue !== null &&
        (comparableValue(d.currentLowValue) !== comparableValue(d.min_val) ||
          comparableValue(d.currentHighValue) !== comparableValue(d.max_val))
      ) {
        if (chartFiltersByDimension[d.table] === undefined) {
          chartFiltersByDimension[d.table] = []
        }
        const betweenFilter = {
          filterType: FILTER_TYPE_BETWEEN,
          isRelative: false,
          dataExpression: d.value,
          dataType: d.type,
          start: d.currentLowValue,
          end: d.currentHighValue,
          extract: extractUnit(d),
          dataSource: chart.dataSource,
          table: d.table
        }

        const chartDimFilter = chart.showNullDimensions
          ? orFilter([
              betweenFilter,
              {
                filterType: FILTER_TYPE_ISNULL,
                dataExpression: d.value,
                dataType: d.type,
                dataTypeIsArray: d.is_array,
                extract: extractUnit(d),
                dataSource: chart.dataSource,
                table: d.table
              }
            ])
          : betweenFilter
        chartFiltersByDimension[d.table].push(chartDimFilter)
      }
    })

    if (Object.keys(chartFiltersByDimension).length) {
      const newChartFilter = {
        chartId,
        appliesTo: "CHART",
        name: chartFilterName,
        enabled: true,
        dataSources: Object.keys(chartFiltersByDimension),
        filter: multiSourceFilter(
          Object.keys(chartFiltersByDimension).reduce((bucket, dim) => {
            bucket[dim] = andFilter(chartFiltersByDimension[dim])
            return bucket
          }, {})
        ),
        isOldFilter: true,
        isBinnedFilter: true
      }

      dispatch(updateDashboardSaveState())

      await dispatch({ type: SET_FILTER_CROSSFILTER, payload: newChartFilter })
    } else if (chartFilter) {
      await dispatch({
        type: DELETE_FILTER_CROSSFILTER,
        payload: { chartId, name: chartFilterName }
      })
    }
  }
}
