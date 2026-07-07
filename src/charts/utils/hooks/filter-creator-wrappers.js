// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_IN,
  FILTER_TYPE_NOT_IN,
  FILTER_TYPE_POLYGON,
  FILTER_TYPE_ST_CONTAINS,
  FILTER_TYPE_ST_INTERSECTS,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_ST_DISTANCE,
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_NOT,
  FILTER_TYPE_UNLIKELY,
  FILTER_TYPE_AND,
  FILTER_TYPE_OR,
  FILTER_TYPE_SQL,
  FILTER_TYPE_MULTISOURCE
} from "vega/constants/filter-type-constants"

import {
  nullFilter,
  notNullFilter,
  simpleFilter,
  betweenFilter,
  inFilter,
  notInFilter,
  polygonFilter,
  stPolygonFilter,
  distanceFilter,
  stDistanceFilter,
  boundingBoxFilter,
  notFilter,
  unlikelyFilter,
  sqlFilter,
  andFilter,
  orFilter,
  multiSourceFilter
} from "vega/constants/filter-types"

// the code is frustratingly recursive, and there are cases where you may end up with
// a value in an object with a given key. In that case, try to unwrap and pull that value out.
// if it's ~not~ an object or that key doesn't exist, assume the arg is the value we originally wanted.
export const unwrap = (arg, ...keys) => {
  for (const key of keys) {
    if (typeof arg === "object" && key in arg) {
      return arg[key]
    }
  }
  return arg
}

// object containing all of the object wrappers that feed into the various vega filter builders
export const filterDispatch = {
  [FILTER_TYPE_ISNULL]: (args = {}) =>
    nullFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      args.options
    ),
  [FILTER_TYPE_ISNOTNULL]: (args = {}) =>
    notNullFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      args.options
    ),
  [FILTER_TYPE_SIMPLE]: (args = {}) => {
    let value = unwrap(args, "value", FILTER_TYPE_SIMPLE)
    if (typeof value === "object" && !Array.isArray(value)) {
      args = { ...args, ...value }
      value = args.value
    }

    return simpleFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      args.operator || "=",
      value,
      args.options
    )
  },
  [FILTER_TYPE_BETWEEN]: (args = {}) => {
    const [start, end] = args[FILTER_TYPE_BETWEEN] || [args.start, args.end]
    return betweenFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      start,
      end,
      args.options
    )
  },
  [FILTER_TYPE_IN]: (args = {}) => {
    const values = unwrap(args, FILTER_TYPE_IN, "values")

    return inFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      values,
      args.options
    )
  },
  [FILTER_TYPE_NOT_IN]: (args = {}) => {
    const values = unwrap(args, FILTER_TYPE_NOT_IN, "values")
    return notInFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      values,
      args.options
    )
  },
  [FILTER_TYPE_POLYGON]: (args = {}) => {
    const poly = unwrap(args, FILTER_TYPE_POLYGON)
    return polygonFilter(
      args.table,
      args.dataSource,
      poly.latExpression,
      poly.lonExpression,
      poly.latDataType,
      poly.lonDataType,
      poly.points,
      poly.boundingBox
    )
  },
  [FILTER_TYPE_ST_CONTAINS]: (args = {}) => {
    const polygon = unwrap(args, FILTER_TYPE_ST_CONTAINS, "polygon")
    return stPolygonFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      FILTER_TYPE_ST_CONTAINS,
      polygon
    )
  },
  [FILTER_TYPE_ST_INTERSECTS]: (args = {}) => {
    const polygon = unwrap(args, FILTER_TYPE_ST_INTERSECTS, "polygon")
    return stPolygonFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      FILTER_TYPE_ST_INTERSECTS,
      polygon
    )
  },
  [FILTER_TYPE_DISTANCE]: (args = {}) => {
    const distance = unwrap(args, FILTER_TYPE_DISTANCE)
    return distanceFilter(
      args.table,
      args.dataSource,
      distance.latExpression,
      distance.lonExpression,
      distance.latDataType,
      distance.lonDataType,
      distance.point,
      distance.distanceInMeters
    )
  },
  [FILTER_TYPE_ST_DISTANCE]: (args = {}) => {
    const distance = unwrap(args, FILTER_TYPE_ST_DISTANCE)
    return stDistanceFilter(
      args.table,
      args.dataSource,
      args.dataExpression,
      args.dataType,
      distance.point,
      distance.distanceInKM,
      args.options
    )
  },
  [FILTER_TYPE_BOUNDING_BOX]: (args = {}) => {
    const bbox = unwrap(args, FILTER_TYPE_BOUNDING_BOX)
    return boundingBoxFilter(
      args.table,
      args.dataSource,
      bbox.latExpression,
      bbox.lonExpression,
      bbox.latDataType,
      bbox.lonDataType,
      bbox.latMin,
      bbox.latMax,
      bbox.lonMin,
      bbox.lonMax,
      bbox.options
    )
  },
  [FILTER_TYPE_SQL]: (args = {}) => {
    const sql = unwrap(args, FILTER_TYPE_SQL, "sql")
    return sqlFilter(args.table, args.dataSource, sql, args.dataExpression)
  },

  [FILTER_TYPE_NOT]: (args, builder) =>
    notFilter(builder(unwrap(args, FILTER_TYPE_NOT))),
  [FILTER_TYPE_UNLIKELY]: (args, builder) =>
    unlikelyFilter(builder(unwrap(args, FILTER_TYPE_UNLIKELY))),
  [FILTER_TYPE_AND]: (args, builder) =>
    andFilter(unwrap(args, FILTER_TYPE_AND).map((f) => builder(f))),
  [FILTER_TYPE_OR]: (args, builder) =>
    orFilter(unwrap(args, FILTER_TYPE_OR).map((f) => builder(f))),

  [FILTER_TYPE_MULTISOURCE]: (args, builder) => {
    return multiSourceFilter({
      [args.dataSource]: builder(args[FILTER_TYPE_MULTISOURCE])
    })
  }
}

// given a dataSource, expression, and type. Wrap up the given filterFunc to
// always get those args handed into them. Also hands along the filterType
// that this was called with, in case you need to unwrap wrapped args.
export const wrapFilterCreator = ({
  table,
  dataSource,
  dataExpression,
  dataType,
  filterType,
  filterFunc
}) => {
  return (args = {}, builder) => {
    const wrappedArgs =
      typeof args !== "object" || Array.isArray(args)
        ? { [filterType]: args }
        : args
    return filterFunc(
      {
        table,
        dataSource,
        dataExpression,
        dataType,
        filterType,
        ...wrappedArgs
      },
      builder
    )
  }
}

// given a dataSource/dataExpression/dataType, wrap all of the filter dispatch to automatically
// provide those values through to the vega builders. This way we don't need to keep handing those
// args along.
export const wrapAllFilterCreators = ({
  table,
  dataSource,
  dataExpression,
  dataType
}) =>
  Object.keys(filterDispatch).reduce(
    (bucket, filterType) => ({
      ...bucket,
      [filterType]: wrapFilterCreator({
        table,
        dataSource,
        dataExpression,
        dataType,
        filterType,
        filterFunc: filterDispatch[filterType]
      })
    }),
    {}
  )

export function buildFiltersForColumn(column, fv, dataSource) {
  const {
    table,
    type: dataType,
    value: dataExpression,
    is_array: dataTypeIsArray = false
  } = column

  const wrappedDispatch = wrapAllFilterCreators({
    table,
    dataSource: dataSource || table,
    dataType,
    dataExpression
  })

  const builderFunc = (filterValue, builder = builderFunc) => {
    // if there's no value, we can create no filter
    if (filterValue === undefined) {
      return undefined
    } else if (filterValue === null) {
      return wrappedDispatch[FILTER_TYPE_ISNULL]({
        options: { dataTypeIsArray }
      })
    }
    // if we're called with an array, assume we actually wanted an "OR" filter and re-tool it to that.
    else if (Array.isArray(filterValue)) {
      return wrappedDispatch[FILTER_TYPE_OR](
        { [FILTER_TYPE_OR]: filterValue },
        builder
      )
    } else if (typeof filterValue === "object") {
      // if it's an already built filter, just return it.
      if ("filterType" in filterValue) {
        return filterValue
      }
      // otherwise, we can only take a filter type as a single arg + whatever its inputs are.
      // this syntax is really only used for and/or filters.
      if (Object.keys(filterValue).length !== 1) {
        throw new Error("Must buildFiltersForColumn with single key object")
      }
      const key = Object.keys(filterValue)[0]

      return wrappedDispatch[key](
        { ...filterValue, options: { dataTypeIsArray } },
        builder
      )
    }
    // and if we're given any other values, assume we want to build a simple filter w/them.
    else {
      return wrappedDispatch[FILTER_TYPE_SIMPLE](
        {
          value: filterValue,
          options: { dataTypeIsArray }
        },
        builder
      )
    }
  }

  return builderFunc(fv)
}
