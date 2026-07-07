// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DATA_TYPE_CATEGORY } from "./constants"
import {
  isOrdinal,
  isPolyGeo,
  isGeo,
  isNumericType,
  isTimeType,
  isLineGeo
} from "constants/data-types"
import { TypeCategory } from "./types"

// Generalized types for display in the data selection modal. Specific types map
// to more generalized types, e.g.
//  - BIGINT, INT => DATA_TYPE_CATEGORY.NUMBER
//  - TIMESTAMP, DATE => DATA_TYPE_CATEGORY.DATE_TIME
//  - etc.
export const getTypeCategory = (type: string): TypeCategory => {
  if (type === DATA_TYPE_CATEGORY.CUSTOM) {
    return DATA_TYPE_CATEGORY.CUSTOM
  } else if (type === DATA_TYPE_CATEGORY.COHORT) {
    return DATA_TYPE_CATEGORY.COHORT
  } else if (isOrdinal(type)) {
    return DATA_TYPE_CATEGORY.ENUM
  } else if (isGeo(type) || isPolyGeo(type) || isLineGeo(type)) {
    return DATA_TYPE_CATEGORY.GEO
  } else if (isNumericType(type)) {
    return DATA_TYPE_CATEGORY.NUMBER
  } else if (isTimeType(type)) {
    return DATA_TYPE_CATEGORY.DATE_TIME
  } else if (type === DATA_TYPE_CATEGORY.COLUMN_PARAMETER) {
    return DATA_TYPE_CATEGORY.COLUMN_PARAMETER
  } else {
    throw new Error(`Unhandled type category: ${type}`)
  }
}
