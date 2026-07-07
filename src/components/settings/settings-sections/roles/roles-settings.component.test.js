// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { renderWithRedux } from "jest/renderScaffolding"
import RolesSettings from "./index"
import { fireEvent } from "@testing-library/react"

describe("<RolesSettings />", () => {
  let defaultState
  beforeEach(() => {
    defaultState = {
      settings: {
        roles: { metadata: [{ name: "roleA" }, { name: "roleB" }] }
      }
    }
  })

  const renderComponent = () =>
    renderWithRedux(<RolesSettings />, null, defaultState)

  test("should render all roles", () => {
    const { queryByText } = renderComponent()
    expect(queryByText("roleA")).toBeInTheDocument()
    expect(queryByText("roleB")).toBeInTheDocument()
  })

  test("should filter by search text", () => {
    const { getByTestId, queryByText } = renderComponent()
    const searchInput = getByTestId("roles-search-input")
    fireEvent.change(searchInput, { target: { value: "B" } })

    expect(queryByText("roleA")).not.toBeInTheDocument()
    expect(queryByText("roleB")).toBeInTheDocument()
  })

  test("should show empty state if search term has no matching roles", () => {
    const { getByTestId, queryByText } = renderComponent()
    const searchInput = getByTestId("roles-search-input")
    fireEvent.change(searchInput, { target: { value: "foo" } })

    expect(queryByText("No results match your criteria.")).toBeInTheDocument()
  })
})
