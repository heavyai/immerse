// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import {
  render,
  getByTestId,
  getByText,
  queryByText,
  fireEvent
} from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { noop } from "utils/helpers"
import AggregateFilter from "./aggregate-filter-component"

import { FILTER_TYPE_SIMPLE } from "vega/constants/filter-type-constants"

const aggregateFilter = {
  name: "-LuKkCxiXemjDVpvC_Rl",
  enabled: true,
  valid: true,
  filter: {
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
}

const defaultProps = {
  filterMetaData: aggregateFilter,
  columnMetaData: [
    { label: "someColumn", type: "BIGINT" },
    { label: "timestampColumn", type: "TIMESTAMP" }
  ],
  updateFilter: noop,
  removeFilter: noop,
  toggleFilter: noop,
  setFilterValidity: noop
}

const enterValue = (container, field = "value", value = "1") => {
  const input = getByTestId(container, `filter-component-input-${field}`)
  input.focus()
  fireEvent.change(input, { target: { value } })
  input.blur()
}

describe("Aggregate filter component updateFilter", () => {
  let updateFilter = null
  beforeEach(() => {
    updateFilter = jest.fn()
  })
  it("should call updateFilter on blur", () => {
    const { container } = render(
      <AggregateFilter {...defaultProps} updateFilter={updateFilter} />
    )
    enterValue(container)
    expect(updateFilter).toHaveBeenCalled()
  })
})

describe("Aggregate filter toggle and delete", () => {
  it("should delete filter", () => {
    const removeFilter = jest.fn()
    const { container } = render(
      <AggregateFilter {...defaultProps} removeFilter={removeFilter} />
    )
    getByTestId(container, "cohort-aggregate-filter-delete").click()
    expect(removeFilter).toHaveBeenCalled()
  })
  it("should toggle filter", () => {
    const toggleFilter = jest.fn()
    const { container } = render(
      <AggregateFilter {...defaultProps} toggleFilter={toggleFilter} />
    )
    const toggle = getByTestId(container, "cohort-aggregate-filter-toggle")
    toggle.click()
    expect(toggle.checked).toBe(true)
  })
})

describe("Aggregate filter component validation", () => {
  it("should call setFilterValidity with false if no value is entered", () => {
    const setFilterValidity = jest.fn()
    const { container } = render(
      <AggregateFilter
        {...defaultProps}
        setFilterValidity={setFilterValidity}
      />
    )
    enterValue(container, "value", "")
    expect(setFilterValidity).toHaveBeenLastCalledWith(
      aggregateFilter.name,
      false
    )
  })
  it("should call setFilterValidity with true when a numeric value is entered", () => {
    const setFilterValidity = jest.fn()
    const { container } = render(
      <AggregateFilter
        {...defaultProps}
        filterMetaData={{ ...aggregateFilter, valid: false }}
        setFilterValidity={setFilterValidity}
      />
    )
    enterValue(container, "value", "7")
    expect(setFilterValidity).toHaveBeenLastCalledWith(
      aggregateFilter.name,
      true
    )
  })
})

describe("Aggregate timestamp filter component", () => {
  const timestampFilter = {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: {
      value: "timestampColumn",
      function: "MAX",
      type: "SimpleAggregateFilterDataExpression"
    },
    dataType: "TIMESTAMP",
    operator: ">=",
    value: "0"
  }

  const timestampUniqueFilter = {
    filterType: FILTER_TYPE_SIMPLE,
    dataExpression: {
      value: "timestampColumn",
      function: "APPROX_COUNT_DISTINCT",
      type: "SimpleAggregateFilterDataExpression"
    },
    dataType: "TIMESTAMP",
    operator: ">=",
    value: "0"
  }

  const timestampAggregateFilter = {
    ...aggregateFilter,
    filter: timestampFilter
  }

  const timestampProps = {
    ...defaultProps,
    filterMetaData: timestampAggregateFilter
  }

  it("should display time selector", () => {
    const { container } = render(<AggregateFilter {...timestampProps} />)
    expect(getByText(container, "Select time...")).toBeTruthy()
  })
  it("should display standard (not time picker) input for '# Unique' option", () => {
    const { container } = render(
      <AggregateFilter
        {...timestampProps}
        filterMetaData={{
          ...timestampAggregateFilter,
          filter: timestampUniqueFilter
        }}
      />
    )
    expect(queryByText(container, "Select time...")).toBeFalsy()
  })
})
