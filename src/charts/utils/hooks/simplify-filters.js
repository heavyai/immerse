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

export const simplifyFilterDispatch = {
  [FILTER_TYPE_ISNULL]: () => null,
  [FILTER_TYPE_ISNOTNULL]: () => ({
    [FILTER_TYPE_ISNOTNULL]: FILTER_TYPE_ISNOTNULL
  }),
  [FILTER_TYPE_SIMPLE]: (f) => {
    if (f.operator === "=") {
      return f.value
    } else {
      return { [FILTER_TYPE_SIMPLE]: { operator: f.operator, value: f.value } }
    }
  },
  [FILTER_TYPE_BETWEEN]: (f) => ({
    [FILTER_TYPE_BETWEEN]: [f.start, f.end]
  }),
  [FILTER_TYPE_IN]: (f) => ({
    [FILTER_TYPE_IN]: f.values
  }),
  [FILTER_TYPE_NOT_IN]: (f) => ({
    [FILTER_TYPE_NOT_IN]: f.values
  }),
  [FILTER_TYPE_POLYGON]: (f) => {
    const {
      latExpression,
      lonExpression,
      latDataType,
      lonDataType,
      points,
      polygon
    } = f
    return {
      [FILTER_TYPE_POLYGON]: {
        latExpression,
        lonExpression,
        latDataType,
        lonDataType,
        points,
        polygon
      }
    }
  },
  [FILTER_TYPE_ST_CONTAINS]: (f) => ({
    [FILTER_TYPE_ST_CONTAINS]: f.polygon
  }),
  [FILTER_TYPE_ST_INTERSECTS]: (f) => ({
    [FILTER_TYPE_ST_INTERSECTS]: f.polygon
  }),
  [FILTER_TYPE_DISTANCE]: (f) => {
    const {
      latExpression,
      lonExpression,
      latDataType,
      lonDataType,
      point,
      distanceInMeters
    } = f
    return {
      [FILTER_TYPE_DISTANCE]: {
        latExpression,
        lonExpression,
        latDataType,
        lonDataType,
        point,
        distanceInMeters
      }
    }
  },
  [FILTER_TYPE_ST_DISTANCE]: (f) => {
    const { point, distanceInKM } = f
    return {
      [FILTER_TYPE_ST_DISTANCE]: {
        point,
        distanceInKM
      }
    }
  },
  [FILTER_TYPE_BOUNDING_BOX]: (f) => {
    const {
      latExpression,
      lonExpression,
      latDataType,
      lonDataType,
      latMin,
      latMax,
      lonMin,
      lonMax
    } = f
    return {
      [FILTER_TYPE_BOUNDING_BOX]: {
        latExpression,
        lonExpression,
        latDataType,
        lonDataType,
        latMin,
        latMax,
        lonMin,
        lonMax
      }
    }
  },
  [FILTER_TYPE_NOT]: (f) => ({
    [FILTER_TYPE_NOT]: simplifyFilter(f.filter)
  }),
  [FILTER_TYPE_UNLIKELY]: (f) => ({
    [FILTER_TYPE_UNLIKELY]: simplifyFilter(f.filter)
  }),
  [FILTER_TYPE_AND]: (f) => ({
    [FILTER_TYPE_AND]: f.filters.map((subFilter) => simplifyFilter(subFilter))
  }),
  [FILTER_TYPE_OR]: (f) =>
    f.filters.map((subFilter) => simplifyFilter(subFilter)),
  [FILTER_TYPE_SQL]: (f) => ({ [FILTER_TYPE_SQL]: f.sql }),
  // PLEASE NOTE. This -still- only allows you to do a single source filter, whether it's stored as multisource or not.
  [FILTER_TYPE_MULTISOURCE]: (f) => {
    return {
      [FILTER_TYPE_MULTISOURCE]: simplifyFilter(
        Object.values(f.filtersByDataSource)?.[0]
      )
    }
  }
}

export function simplifyFilter(f) {
  return simplifyFilterDispatch[f.filterType](f)
}
