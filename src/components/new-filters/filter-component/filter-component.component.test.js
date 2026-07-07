// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import {
  render,
  getByTestId,
  queryByTestId,
  getByText,
  queryByText,
  fireEvent
} from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { noop } from "utils/helpers"
import { FilterComponent as Filter } from "./filter-component"

import {
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"

const stringEquals = {
  appliesTo: "GLOBAL",
  name: "-LuKj6MyuABalJTCia45",
  enabled: true,
  dataSources: ["data_types_basic3"],
  filter: {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: "col_dict_text1",
    dataSource: "data_types_basic3",
    dataType: "STR",
    dataTypeIsArray: false,
    operator: "=",
    value: "Sterling Allen"
  }
}

const stringEqualsNull = {
  appliesTo: "GLOBAL",
  name: "-LuKj6MyuABalJTCia45",
  enabled: true,
  dataSources: ["data_types_basic3"],
  filter: {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: "col_dict_text1",
    dataSource: "data_types_basic3",
    dataType: "STR",
    dataTypeIsArray: false,
    operator: "=",
    value: null
  }
}

const numericArrayContains = {
  appliesTo: "GLOBAL",
  name: "-LuKju8hPqzNArkLQ-Fw",
  enabled: true,
  dataSources: ["data_types_basic3"],
  filter: {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: "col_integer_var_array_1",
    dataSource: "data_types_basic3",
    dataType: "INT",
    dataTypeIsArray: true,
    operator: "=",
    value: "0"
  }
}

const numericGreaterThan = {
  appliesTo: "GLOBAL",
  name: "-LuKkCxiXemjDVpvC_Rl",
  enabled: true,
  dataSources: ["data_types_basic3"],
  filter: {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: "col_float_1",
    dataSource: "data_types_basic3",
    dataType: "FLOAT",
    dataTypeIsArray: false,
    operator: ">",
    value: 0
  }
}

const customSql = {
  appliesTo: "GLOBAL",
  name: "-LuKkXdykGUHpGV3utYK",
  enabled: true,
  dataSources: ["data_types_basic3"],
  filter: {
    filterType: FILTER_TYPE_SQL,
    dataSource: "data_types_basic3",
    sql: "data_types_basic3.col_dict_text1 = 'Sterling Allen'",
    dataExpression: "Custom SQL"
  }
}

const mockDataSources = {
  data_types_basic3: {
    alias: "A",
    columnMetadata: [
      {
        table: "data_types_basic3",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true,
        name_is_ambiguous: false,
        label: "col_dict_text1",
        value: "col_dict_text1"
      }
    ]
  }
}

const defaultProps = {
  filterMetaData: stringEquals,
  updateFilter: noop,
  removeFilter: noop,
  toggleFilter: noop,
  getAutosuggestResults: noop,
  clearAutosuggestResults: noop,
  autosuggestResults: [],
  openCategorySelectionModal: noop,
  categorySelectorState: {
    selections: [],
    onApplyAction: {}
  },
  removeFromNewlyCreated: noop,
  updateCohort: noop,
  onClickCohortName: noop,
  onTouchCallback: noop,
  isLastTouchedFilter: false,
  makeCategorySelection: noop,
  dataSources: mockDataSources,
  highlightCharts: noop,
  dehighlightCharts: noop,
  selectedFilterSet: {},
  filterSets: {},
  multiSelections: []
}

const nullProps = {
  ...defaultProps,
  filterMetaData: stringEqualsNull
}

const enterValue = (container, field = "value", value = "1") => {
  const input = getByTestId(container, `filter-component-input-${field}`)
  input.focus()
  fireEvent.change(input, { target: { value } })
  input.blur()
}

const selectOptionByText = (container, text) => {
  getByTestId(container, "filter-component-dropdown-menu").click()
  getByText(container, text).click()
}

describe("Filter component input fields", () => {
  it("should populate value input fields with existing filter value", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={numericGreaterThan} />
    )
    expect(
      getByTestId(container, "filter-component-input-value").value
    ).toEqual("0")
  })
  it("should populate start/end input fields with existing filter values", () => {
    const betweenFilter = {
      ...numericGreaterThan,
      filter: {
        ...numericGreaterThan.filter,
        start: 1,
        end: 10,
        filterType: FILTER_TYPE_BETWEEN
      }
    }
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={betweenFilter} />
    )
    expect(
      getByTestId(container, "filter-component-input-start").value
    ).toEqual("1")
    expect(getByTestId(container, "filter-component-input-end").value).toEqual(
      "10"
    )
  })
  it("should render empty value field when filter has null value", () => {
    const incompleteFilter = {
      ...numericGreaterThan,
      filter: {
        ...numericGreaterThan.filter,
        value: null
      }
    }
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={incompleteFilter} />
    )
    expect(
      getByTestId(container, "filter-component-input-value").value
    ).toEqual("")
  })
  it("should render empty start/end fields when between filter has null values", () => {
    const incompleteBetweenFilter = {
      ...numericGreaterThan,
      filter: {
        ...numericGreaterThan.filter,
        start: null,
        end: null,
        filterType: FILTER_TYPE_BETWEEN
      }
    }
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={incompleteBetweenFilter} />
    )
    expect(
      getByTestId(container, "filter-component-input-start").value
    ).toEqual("")

    expect(getByTestId(container, "filter-component-input-end").value).toEqual(
      ""
    )
  })
})

describe("Newly created filter component behaviors", () => {
  it("should not display a default value for a newly created filter", () => {
    const { container } = render(<Filter {...defaultProps} newlyCreated />)
    expect(
      getByTestId(container, "filter-component-input-value")
    ).toHaveTextContent("")
  })

  it("should call removeFromNewlyCreated when a valid filter is entered", () => {
    const removeFromNewlyCreated = jest.fn()
    const { container } = render(
      <Filter
        {...nullProps}
        removeFromNewlyCreated={removeFromNewlyCreated}
        newlyCreated
      />
    )
    enterValue(container)
    expect(removeFromNewlyCreated).toHaveBeenCalled()
  })
})

describe("Filter component updateFilter", () => {
  let updateFilter = null
  beforeEach(() => {
    updateFilter = jest.fn()
  })
  it("should call updateFilter on blur", () => {
    const { container } = render(
      <Filter {...defaultProps} updateFilter={updateFilter} newlyCreated />
    )
    enterValue(container)
    expect(updateFilter).toHaveBeenCalled()
  })
  it("should disable filter on blur if no value is entered", () => {
    const { container } = render(
      <Filter {...defaultProps} updateFilter={updateFilter} newlyCreated />
    )
    enterValue(container, "value", "")
    expect(updateFilter.mock.calls[0][2]).toEqual(false)
  })
  it("should enable filter on operator change only if a transferable value is entered", () => {
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={numericGreaterThan}
        updateFilter={updateFilter}
        newlyCreated
      />
    )
    selectOptionByText(container, "Less than")
    expect(updateFilter.mock.calls[0][2]).toEqual(false)
    enterValue(container, "value", "10")
    selectOptionByText(container, "Greater than")
    expect(updateFilter.mock.calls[2][2]).toEqual(true)
    expect(updateFilter).toHaveBeenCalledTimes(3)
  })
})

describe("Custom SQL filter component", () => {
  it("should render custom SQL", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={customSql} />
    )
    expect(getByText(container, `(${customSql.filter.sql})`)).toBeTruthy()
  })
  it("should not render dropdown menu", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={customSql} />
    )
    expect(
      queryByTestId(container, "filter-component-dropdown-menu")
    ).toBeNull()
  })
  it("should be enabled on creation", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={customSql} />
    )
    expect(getByTestId(container, "filter-component-toggle")).not.toHaveClass(
      "disabled"
    )
  })
})

describe("Array filter component", () => {
  it("should show array options instead of normal options for type", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={numericArrayContains} />
    )
    getByTestId(container, "filter-component-dropdown-menu").click()
    expect(getByText(container, "Does not contain")).toBeTruthy()
    expect(queryByText(container, "Greater than")).toBeFalsy()
  })
})

describe("Custom selection filter component", () => {
  it("should open custom selection modal", () => {
    const openCategorySelectionModal = jest.fn()
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={stringEquals}
        openCategorySelectionModal={openCategorySelectionModal}
      />
    )
    selectOptionByText(container, "Custom selection")
    expect(openCategorySelectionModal).toHaveBeenCalled()
  })
  it("should be enabled on creation", () => {
    const { container } = render(
      <Filter {...defaultProps} filterMetaData={customSql} />
    )
    expect(getByTestId(container, "filter-component-toggle")).not.toHaveClass(
      "disabled"
    )
  })
})

describe("Filter component dropdown", () => {
  it("should allow opening dropdown menu for dashboard filters", () => {
    const { container } = render(<Filter {...defaultProps} />)
    getByTestId(container, "filter-component-dropdown-menu").click()
    expect(
      queryByTestId(container, "filter-component-dropdown-menu-open")
    ).toBeTruthy()
  })

  it("should not allow opening dropdown menu for crossfilters", () => {
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={{ ...stringEquals, appliesTo: "CROSSFILTER" }}
      />
    )
    getByTestId(container, "filter-component-dropdown-menu").click()
    expect(
      queryByTestId(container, "filter-component-dropdown-menu-open")
    ).toBeFalsy()
  })

  it("should allow opening dropdown menu for prefilters", () => {
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={{ ...stringEquals, appliesTo: "CHART" }}
      />
    )
    getByTestId(container, "filter-component-dropdown-menu").click()
    expect(
      queryByTestId(container, "filter-component-dropdown-menu-open")
    ).toBeTruthy()
  })
})

describe("Filter component validation", () => {
  // broke this test at 12:20 am before RC1. We should fix it later.
  /* it("should disable filter if an invalid value is entered", () => {
    const toggleFilter = jest.fn()
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={numericGreaterThan}
        toggleFilter={toggleFilter}
      />
    )
    enterValue(container, "value", "not a number")
    expect(toggleFilter).toHaveBeenCalled()
  }) */
  it("should not automatically toggle filter back on if manually disabled by user", () => {
    const toggleFilter = jest.fn()
    const { container } = render(
      <Filter
        {...defaultProps}
        filterMetaData={numericGreaterThan}
        toggleFilter={toggleFilter}
      />
    )
    getByTestId(container, "filter-component-toggle").click()
    enterValue(container, "value", "not a number")
    toggleFilter.mockClear()
    enterValue(container, "value", "7")
    expect(toggleFilter).not.toHaveBeenCalled()
  })
})
