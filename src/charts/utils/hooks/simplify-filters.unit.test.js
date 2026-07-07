// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildFiltersForColumn } from "./filter-creator-wrappers"

import { simplifyFilter } from "./simplify-filters"

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

const dataSource = "testDataSource"
const dataExpression = "testDataExpression"
const dataType = "testDataType"
const value = "testValue"

const testColumn = {
  table: dataSource,
  dataSource,
  type: dataType,
  value: dataExpression
}

/* eslint-disable react/display-name */

describe("simplify filters test suite ", () => {
  it("can simplify null filter", () => {
    const originalFilter = buildFiltersForColumn(testColumn, null)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(null)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify null filter w/object", () => {
    const simpleInput = {
      [FILTER_TYPE_ISNULL]: FILTER_TYPE_ISNULL
    }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(null)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify notnull filter", () => {
    const simpleInput = {
      [FILTER_TYPE_ISNOTNULL]: FILTER_TYPE_ISNOTNULL
    }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify simple filter", () => {
    const originalFilter = buildFiltersForColumn(testColumn, {
      [FILTER_TYPE_SIMPLE]: value
    })
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(value)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify simple filter w/operator", () => {
    const simpleInput = {
      [FILTER_TYPE_SIMPLE]: { value, operator: "!=" }
    }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify between filter", () => {
    const simpleInput = {
      [FILTER_TYPE_BETWEEN]: [3, 4]
    }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify in filter", () => {
    const simpleInput = { [FILTER_TYPE_IN]: [3, 4, "x"] }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)

    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify not in filter", () => {
    const simpleInput = { [FILTER_TYPE_NOT_IN]: [3, 4, "x"] }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify polygon filter", () => {
    const simpleInput = {
      [FILTER_TYPE_POLYGON]: {
        latExpression: "testLatExpression",
        lonExpression: "testLonExpression",
        latDataType: "testLatDataType",
        lonDataType: "testLonDataType",
        points: [
          [1, 2],
          [3, 4]
        ]
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify st contains filter", () => {
    const simpleInput = {
      [FILTER_TYPE_ST_CONTAINS]: {
        polygon: [
          [1, 2],
          [3, 4]
        ]
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify st intersects filter", () => {
    const simpleInput = {
      [FILTER_TYPE_ST_INTERSECTS]: {
        polygon: [
          [1, 2],
          [3, 4]
        ]
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify distance filter", () => {
    const simpleInput = {
      [FILTER_TYPE_DISTANCE]: {
        latExpression: "testLatExpression",
        lonExpression: "testLonExpression",
        latDataType: "testLatDataType",
        lonDataType: "testLonDataType",
        point: [1, 2],
        distanceInMeters: 3
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify stDistance filter", () => {
    const simpleInput = {
      [FILTER_TYPE_ST_DISTANCE]: {
        point: [1, 2],
        distanceInKM: 7
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify bounding box filter", () => {
    const simpleInput = {
      [FILTER_TYPE_BOUNDING_BOX]: {
        latExpression: "testLatExpression",
        lonExpression: "testLonExpression",
        latDataType: "testLatDataType",
        lonDataType: "testLonDataType",
        latMin: 0,
        latMax: 7,
        lonMin: 1,
        lonMax: 8
      }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify not filter", () => {
    const simpleInput = {
      [FILTER_TYPE_NOT]: 3
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify not filter w/array", () => {
    const simpleInput = {
      [FILTER_TYPE_NOT]: [1, 2]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify not filter w/complex object", () => {
    const simpleInput = {
      [FILTER_TYPE_NOT]: { AND: [2, { BETWEEN: [3, 4] }] }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify unlikely filter", () => {
    const simpleInput = {
      [FILTER_TYPE_UNLIKELY]: 3
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify unlikely filter w/array", () => {
    const simpleInput = {
      [FILTER_TYPE_UNLIKELY]: [1, 2]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify unlikely filter w/complex object", () => {
    const simpleInput = {
      [FILTER_TYPE_UNLIKELY]: { AND: [2, { BETWEEN: [3, 4] }] }
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify and filter", () => {
    const simpleInput = {
      [FILTER_TYPE_AND]: [3]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify and filter w/array", () => {
    const simpleInput = {
      [FILTER_TYPE_AND]: [1, 2]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify and filter w/complex object", () => {
    const simpleInput = {
      [FILTER_TYPE_AND]: [2, { BETWEEN: [3, 4] }]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify or filter", () => {
    const simpleInput = {
      [FILTER_TYPE_OR]: [3]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput[FILTER_TYPE_OR])

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify or filter w/array", () => {
    const simpleInput = {
      [FILTER_TYPE_OR]: [1, 2]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput[FILTER_TYPE_OR])

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify or filter w/complex object", () => {
    const simpleInput = {
      [FILTER_TYPE_OR]: [2, { BETWEEN: [3, 4] }]
    }

    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput[FILTER_TYPE_OR])

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify sql filter", () => {
    const simpleInput = {
      [FILTER_TYPE_SQL]: value // value === "testValue"
    }
    const originalFilter = buildFiltersForColumn(testColumn, simpleInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(simpleInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })

  it("can simplify multisource filter", () => {
    const multisourceInput = {
      [FILTER_TYPE_MULTISOURCE]: 1
    }

    const originalFilter = buildFiltersForColumn(testColumn, multisourceInput)
    const simplifiedFilter = simplifyFilter(originalFilter)

    expect(simplifiedFilter).toEqual(multisourceInput)

    const recreatedFilter = buildFiltersForColumn(testColumn, simplifiedFilter)

    expect(originalFilter).toEqual(recreatedFilter)
  })
})
