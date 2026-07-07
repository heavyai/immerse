// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as filterOptions from "./filter-component-options"
import {
  NUMERICAL_INTEGER_TYPES,
  BOOL_TYPES,
  TEXT_TYPES,
  TIME_UNITS
} from "constants/data-types"

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_OR,
  FILTER_TYPE_NOT
} from "vega/constants/filter-type-constants"

const greaterThanOrEqualFilter = {
  filterType: FILTER_TYPE_SIMPLE,
  dataExpression: "flight_year",
  dataSource: "flights",
  dataType: "SMALLINT",
  operator: ">=",
  value: 0
}

const betweenFilter = {
  filterType: FILTER_TYPE_BETWEEN,
  dataExpression: "flight_year",
  dataSource: "flights",
  dataType: "SMALLINT",
  start: 2000,
  end: 2009
}

const notEqualFilter = {
  filterType: FILTER_TYPE_NOT,
  filter: {
    filterType: FILTER_TYPE_SIMPLE,
    dataType: "SMALLINT",
    operator: "=",
    value: 0
  }
}

const notBetweenFilter = {
  filterType: FILTER_TYPE_NOT,
  filter: betweenFilter
}

const lastYearFilter = {
  filterType: FILTER_TYPE_BETWEEN,
  isRelative: true,
  dataExpression: "pickup_datetime",
  dataSource: "nyc_taxi_nolion_2014",
  dataType: "TIMESTAMP",
  start: {
    func: "TRUNC",
    datePart: "YEAR",
    value: {
      func: "ADD",
      datePart: "YEAR",
      adjustment: -1,
      value: "NOW"
    }
  },
  end: {
    func: "TRUNC",
    datePart: "YEAR",
    value: "NOW"
  }
}

const todayFilter = {
  filterType: FILTER_TYPE_BETWEEN,
  isRelative: true,
  dataExpression: "pickup_datetime",
  dataSource: "nyc_taxi_nolion_2014",
  dataType: "TIMESTAMP",
  start: {
    func: "TRUNC",
    datePart: "DAY",
    value: "NOW"
  },
  end: "NOW"
}

const last10MinutesFilter = {
  filterType: FILTER_TYPE_BETWEEN,
  isRelative: true,
  dataExpression: "pickup_datetime",
  dataSource: "nyc_taxi_nolion_2014",
  dataType: "TIMESTAMP",
  start: {
    func: "ADD",
    datePart: "MINUTE",
    adjustment: -10,
    value: "NOW"
  },
  end: "NOW"
}

const last7DaysFilter = {
  filterType: FILTER_TYPE_BETWEEN,
  isRelative: true,
  dataExpression: "pickup_datetime",
  dataSource: "nyc_taxi_nolion_2014",
  dataType: "TIMESTAMP",
  start: {
    func: "TRUNC",
    datePart: "DAY",
    adjustment: -7,
    value: "NOW"
  },
  end: "NOW"
}

const customSelectionFilter = {
  filterType: FILTER_TYPE_OR,
  filters: [
    {
      filterType: FILTER_TYPE_SIMPLE,
      dataType: "STR",
      operator: "=",
      value: "value1"
    },
    {
      filterType: FILTER_TYPE_SIMPLE,
      dataType: "STR",
      operator: "=",
      value: "value2"
    }
  ]
}

const dataSources = {
  data1: {
    columnMetadata: [
      { label: "dict", is_dict: true },
      { label: "nonDict", is_dict: false },
      { label: "nonString" }
    ]
  }
}

describe("Filter component helpers", () => {
  describe("optionNameFromFilter", () => {
    it("should return option name for simple filters", () => {
      expect(
        filterOptions.optionNameFromFilter(greaterThanOrEqualFilter)
      ).toEqual(filterOptions.greaterThanOrEqual.name)
    })
    it("should return option name for ISNULL filters", () => {
      expect(
        filterOptions.optionNameFromFilter({
          filterType: FILTER_TYPE_ISNULL
        })
      ).toEqual(filterOptions.isNull.name)
    })
    it("should return option name for ISNOTNULL filters", () => {
      expect(
        filterOptions.optionNameFromFilter({
          filterType: FILTER_TYPE_ISNOTNULL
        })
      ).toEqual(filterOptions.notNull.name)
    })
    it("should return option name for BETWEEN filters", () => {
      expect(filterOptions.optionNameFromFilter(betweenFilter)).toEqual(
        filterOptions.between.name
      )
    })
    it("should return option names for negated filters", () => {
      expect(filterOptions.optionNameFromFilter(notEqualFilter)).toEqual(
        filterOptions.notEqual.name
      )
      expect(filterOptions.optionNameFromFilter(notBetweenFilter)).toEqual(
        filterOptions.notBetween.name
      )
    })
    it("should return option names for array datatypes", () => {
      const arrayContainsFilter = {
        dataTypeIsArray: true,
        filterType: FILTER_TYPE_SIMPLE,
        operator: "=",
        value: 0
      }

      expect(filterOptions.optionNameFromFilter(arrayContainsFilter)).toEqual(
        filterOptions.arrayContains.name
      )

      expect(
        filterOptions.optionNameFromFilter({
          filterType: FILTER_TYPE_NOT,
          filter: arrayContainsFilter
        })
      ).toEqual(filterOptions.arrayNotContains.name)

      expect(
        filterOptions.optionNameFromFilter({
          dataTypeIsArray: true,
          filterType: FILTER_TYPE_ISNULL
        })
      ).toEqual(filterOptions.isNull.name)

      expect(
        filterOptions.optionNameFromFilter({
          dataTypeIsArray: true,
          filterType: FILTER_TYPE_ISNOTNULL
        })
      ).toEqual(filterOptions.notNull.name)
    })
    it("should return the proper option names for relative time filters", () => {
      expect(filterOptions.optionNameFromFilter(last10MinutesFilter)).toEqual(
        filterOptions.LAST10MINUTE.name
      )
      expect(filterOptions.optionNameFromFilter(lastYearFilter)).toEqual(
        filterOptions.LAST1YEAR.name
      )
      expect(filterOptions.optionNameFromFilter(last7DaysFilter)).toEqual(
        filterOptions.LAST7DAY.name
      )
      expect(filterOptions.optionNameFromFilter(todayFilter)).toEqual(
        filterOptions.THISDAY.name
      )
    })
    it("should return the proper option name for 'custom selection' filters", () => {
      expect(filterOptions.optionNameFromFilter(customSelectionFilter)).toEqual(
        filterOptions.multiSelect.name
      )
    })
  })

  describe("optionNameFromCohortFilter", () => {
    const cohortFilterMetaData = {
      cohortDimension: {
        name: "col_dict_text1",
        negated: false,
        cohortName: "poly",
        dataSource: "data_types_basic3"
      }
    }

    it("should return cohort includes option", () => {
      expect(
        filterOptions.optionNameFromCohortFilter(cohortFilterMetaData)
      ).toEqual(filterOptions.cohortInclude.name)
    })

    it("should return cohort exclude option", () => {
      expect(
        filterOptions.optionNameFromCohortFilter({
          ...cohortFilterMetaData,
          cohortDimension: { negated: true }
        })
      ).toEqual(filterOptions.cohortExclude.name)
    })
  })

  describe("updatedFilterFromOption", () => {
    it("should return an updated simple filter", () => {
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.greaterThanOrEqual.name,
          greaterThanOrEqualFilter,
          { value: 10 }
        )
      ).toMatchObject({
        ...greaterThanOrEqualFilter,
        value: 10
      })
    })
    it("should return an updated between filter", () => {
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.between.name,
          betweenFilter,
          { start: 2001, end: 2008 }
        )
      ).toMatchObject({
        ...betweenFilter,
        start: 2001,
        end: 2008
      })
    })
    it("should return updated negated filters", () => {
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.notBetween.name,
          notBetweenFilter,
          { start: 2001, end: 2008 }
        )
      ).toMatchObject({
        ...notBetweenFilter,
        filter: {
          start: 2001,
          end: 2008
        }
      })
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.notEqual.name,
          notEqualFilter,
          { value: 1 }
        )
      ).toMatchObject({
        ...notEqualFilter,
        filter: { value: 1 }
      })
    })
    it("should return updated aggregate filters", () => {
      const aggregateFilter = {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: {
          value: "someColumn",
          function: "MAX",
          type: "SimpleAggregateFilterDataExpression"
        },
        dataType: "BIGINT",
        operator: "=",
        value: "0"
      }

      const columnMetaData = [{ label: "someColumn", type: "BIGINT" }]

      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.greaterThanOrEqual.name,
          aggregateFilter,
          { aggregate: filterOptions.min.name, value: "0" },
          columnMetaData
        )
      ).toMatchObject({
        ...aggregateFilter,
        dataExpression: {
          value: "someColumn",
          function: filterOptions.min.aggregateFunction,
          type: "SimpleAggregateFilterDataExpression"
        },
        value: "0",
        operator: ">="
      })
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.equal.name,
          aggregateFilter,
          { value: "2011" },
          columnMetaData
        )
      ).toMatchObject({
        ...aggregateFilter,
        value: "2011"
      })
    })
    it("should return correct dataType for aggregate filters", () => {
      const aggregateFilter = {
        filterType: FILTER_TYPE_SIMPLE,
        dataExpression: {
          value: "someColumn",
          function: "MAX",
          type: "SimpleAggregateFilterDataExpression"
        },
        dataType: "TIMESTAMP",
        operator: "=",
        value: "0"
      }
      const columnMetaData = [{ label: "someColumn", type: "TIMESTAMP" }]
      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.equal.name,
          aggregateFilter,
          { aggregate: filterOptions.unique.name, value: "0" },
          columnMetaData
        )
      ).toMatchObject({
        ...aggregateFilter,
        dataExpression: {
          value: "someColumn",
          function: filterOptions.unique.aggregateFunction,
          type: "SimpleAggregateFilterDataExpression"
        },
        dataType: filterOptions.unique.dataType
      })

      expect(
        filterOptions.updatedFilterFromOption(
          filterOptions.equal.name,
          aggregateFilter,
          { aggregate: "Min", value: "0" },
          columnMetaData
        )
      ).toMatchObject({
        ...aggregateFilter,
        dataExpression: {
          value: "someColumn",
          function: filterOptions.min.aggregateFunction,
          type: "SimpleAggregateFilterDataExpression"
        }
      })
    })
  })
  describe("updatedRelativeFilterFromOption", () => {
    it("should return updated relative time filters", () => {
      const baseRelativeFilter = {
        dataExpression: "pickup_datetime",
        dataSource: "nyc_taxi_nolion_2014",
        dataType: "TIMESTAMP"
      }
      expect(
        filterOptions.updatedRelativeFilterFromOption(
          filterOptions.LAST10MINUTE.name,
          baseRelativeFilter
        )
      ).toEqual(last10MinutesFilter)
      expect(
        filterOptions.updatedRelativeFilterFromOption(
          filterOptions.LAST7DAY.name,
          baseRelativeFilter
        )
      ).toEqual(last7DaysFilter)
      expect(
        filterOptions.updatedRelativeFilterFromOption(
          filterOptions.LAST1YEAR.name,
          baseRelativeFilter
        )
      ).toEqual(lastYearFilter)
    })
  })
  describe("Option list", () => {
    it("should return the option list for numerical data types", () => {
      Object.keys(NUMERICAL_INTEGER_TYPES).forEach((type) => {
        expect(
          filterOptions.optionsForDataType({ dataType: type }, {}, false)
        ).toEqual(filterOptions.numericOptions)
      })
    })
    it("should return the option list for boolean data types", () => {
      Object.keys(BOOL_TYPES).forEach((type) => {
        expect(
          filterOptions.optionsForDataType({ dataType: type }, {}, false)
        ).toEqual(filterOptions.boolOptions)
      })
    })
    it("should return the option list for text data types", () => {
      const nonDictTextOptions = filterOptions.textOptions.filter(
        (option) => option.name !== "MULTI"
      )
      Object.keys(TEXT_TYPES).forEach((type) => {
        expect(
          filterOptions.optionsForDataType(
            {
              dataType: type,
              dataSource: "data1",
              dataExpression: "dict"
            },
            { dataSources },
            false
          )
        ).toEqual(filterOptions.textOptions)
        expect(
          filterOptions.optionsForDataType(
            {
              dataType: type,
              dataSource: "data1",
              dataExpression: "nonDict"
            },
            { dataSources },
            false
          )
        ).toEqual(nonDictTextOptions)
      })
    })
    it("should return the option list for time data types", () => {
      Object.keys(TIME_UNITS).forEach((type) => {
        expect(
          filterOptions.optionsForDataType({ dataType: type }, {}, false)
        ).toEqual(filterOptions.timeOptions)
      })
    })
    it("should return the option list for array data types", () => {
      expect(
        filterOptions.optionsForDataType({ dataTypeIsArray: true }, {}, false)
      ).toEqual(filterOptions.arrayOptions)
    })
  })
  describe("shouldShowAutosuggest", () => {
    it("should return true for filters on boolean columns", () => {
      expect(
        filterOptions.shouldShowAutosuggest(
          {
            dataType: "BOOL",
            dataSource: "data1",
            dataExpression: "nonDict"
          },
          filterOptions.exact.name,
          { dataSources }
        )
      ).toEqual(true)
    })
    it("should only return true for exact match filters on dict-encoded strings", () => {
      const dictFilter = {
        dataType: "STR",
        dataSource: "data1",
        dataExpression: "dict"
      }
      expect(
        filterOptions.shouldShowAutosuggest(
          dictFilter,
          filterOptions.equal.name,
          { dataSources }
        )
      ).toEqual(true)
      expect(
        filterOptions.shouldShowAutosuggest(
          dictFilter,
          filterOptions.contains.name,
          { dataSources }
        )
      ).toBeFalsy()
    })
  })
  describe("filterIsDict", () => {
    it("should return true for filters on dict-encoded string types", () => {
      expect(
        filterOptions.filterIsDictEncoded(
          {
            dataType: "STR",
            dataSource: "data1",
            dataExpression: "dict"
          },
          { dataSources }
        )
      ).toEqual(true)
    })
    it("should return false for filters on string types that are not dict encoded", () => {
      expect(
        filterOptions.filterIsDictEncoded(
          {
            dataType: "STR",
            dataSource: "data1",
            dataExpression: "nonDict"
          },
          { dataSources }
        )
      ).toEqual(false)
    })
    it("should return false for filters on non-string dataTypes", () => {
      expect(
        filterOptions.filterIsDictEncoded(
          {
            dataType: "FLOAT",
            dataSource: "data1",
            dataExpression: "nonString"
          },
          { dataSources }
        )
      ).toEqual(false)
    })
  })
  describe("multiSelectFilterFromValues", () => {
    it("should create a custom selection filter from values", () => {
      const baseFilter = {
        dataExpression: "flight_year",
        dataSource: "flights",
        dataType: "SMALLINT"
      }

      const equalFilter = {
        ...baseFilter,
        filterType: FILTER_TYPE_SIMPLE,
        operator: "="
      }
      expect(
        filterOptions.multiSelectFilterFromValues(baseFilter, ["a", "b"])
      ).toEqual({
        filterType: FILTER_TYPE_OR,
        filters: [
          { ...equalFilter, value: "a" },
          { ...equalFilter, value: "b" }
        ]
      })
    })
  })
})
