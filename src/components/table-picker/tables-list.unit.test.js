// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import TablesList from "components/table-picker/tables-list"

describe("TablesList Component", () => {
  let props

  beforeEach(() => {
    props = {
      list: [{ name: "flights" }, { name: "tweets" }, { name: "taxis" }],
      searchVal: "",
      gotoTableImporter: jest.fn(),
      selectPreviewTable: jest.fn(),
      canCreateTable: true,
      determineIfSelected: () => false
    }
  })

  it("should render the tables props as a list of tables", () => {
    render(<TablesList {...props} />)

    const tableRows = screen.getAllByTestId("table-row", { exact: false })
    expect(tableRows).toHaveLength(props.list.length)
  })

  it("should filter tables list by searchVal", () => {
    const newSearchVal = "tw"
    render(
      <TablesList
        {...props}
        searchVal={newSearchVal}
        list={props.list}
        selectPreviewTable={props.selectPreviewTable}
        gotoTableImporter={props.gotoTableImporter}
        canCreateTable
      />
    )

    const filteredTableRows = screen.getAllByTestId("table-row", {
      exact: false
    })
    expect(filteredTableRows).toHaveLength(1)
  })

  it("should set the preview state to the selected table name and index", () => {
    const index = 0
    render(<TablesList {...props} />)

    const tableRows = screen.getAllByTestId("table-row", { exact: false })
    fireEvent.click(tableRows[index])

    expect(props.selectPreviewTable).toHaveBeenCalledWith(
      props.list[index].name,
      index
    )
  })
})
