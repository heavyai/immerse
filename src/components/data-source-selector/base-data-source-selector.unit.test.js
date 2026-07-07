// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"

import { BaseDataSourceSelector } from "./base-data-source-selector"

describe("BaseDataSourceSelector", () => {
  const defaultProps = {
    tables: [{ name: "flights" }, { name: "tweets" }, { name: "contribs" }],
    onDropdownClose: jest.fn()
  }

  it("should only render 'Add Source' if no data source is passed", () => {
    const wrapper = render(
      withStoreContext(<BaseDataSourceSelector {...defaultProps} />)
    )

    expect(screen.queryByTestId("data-source-autocomplete")).toBeFalsy()
    expect(wrapper.getByTestId("add-source")).toBeTruthy()
  })

  it("should render data source if one is passed", () => {
    const wrapper = render(
      withStoreContext(
        <BaseDataSourceSelector
          {...{ ...defaultProps, dataSource: "flights" }}
        />
      )
    )

    expect(screen.queryByTestId("add-source")).toBeFalsy()
    expect(wrapper.queryAllByText("flights")).toHaveLength(1)
  })

  it("should get tables if tables empty", () => {
    const getTables = jest.fn()

    render(
      withStoreContext(
        <BaseDataSourceSelector
          {...{ ...defaultProps, tables: [], getTables }}
        />
      )
    )

    expect(getTables).toHaveBeenCalled()
  })
})
