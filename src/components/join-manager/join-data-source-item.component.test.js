// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { screen, fireEvent } from "@testing-library/react"
import { JoinDataSourceItem } from "./join-data-source-item"
import { ParameterTypes } from "components/parameters/parameters-types"
import { renderWithRedux } from "jest/renderScaffolding"
import { OPEN_JOIN_MANAGER } from "./join-manager-actions"

describe("<JoinDataSourceItem />", () => {
  const mockItem = {
    value: "mockValue",
    label: "mockLabel",
    name: "mockName",
    type: ParameterTypes.JOIN,
    parameter: "mockParamName"
  }

  it("should render a join data source item", () => {
    renderWithRedux(<JoinDataSourceItem item={mockItem} />)
    expect(screen.getByText(mockItem.label)).toBeInTheDocument()
  })

  it("should toggle icon/edit on hover", () => {
    renderWithRedux(<JoinDataSourceItem item={mockItem} />)
    expect(screen.getByTestId("data-source-icon")).toBeInTheDocument()
    fireEvent.mouseEnter(
      screen.getByTestId("join-autocomplete-dropdown-item-content")
    )
    expect(screen.queryByTestId("data-source-icon")).not.toBeInTheDocument()
    expect(screen.getByTestId("edit-join-data-source")).toBeInTheDocument()
  })

  it("should dispatch open join dialog action when edit is clicked", () => {
    const fakeDataSource = {
      id: "1",
      parameter: mockItem.parameter,
      name: "Fake Join",
      joins: []
    }
    const { store } = renderWithRedux(
      <JoinDataSourceItem item={mockItem} />,
      null,
      {
        joinDataSources: [fakeDataSource]
      }
    )
    jest.spyOn(store, "dispatch")
    expect(screen.getByTestId("data-source-icon")).toBeInTheDocument()
    fireEvent.mouseEnter(
      screen.getByTestId("join-autocomplete-dropdown-item-content")
    )
    expect(screen.queryByTestId("data-source-icon")).not.toBeInTheDocument()
    expect(screen.getByTestId("edit-join-data-source")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("edit-join-data-source"))
    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        joinManagerProps: expect.objectContaining({
          joinDefinition: fakeDataSource
        }),
        type: expect.stringMatching(OPEN_JOIN_MANAGER)
      })
    )
  })
})
