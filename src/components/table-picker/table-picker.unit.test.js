// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import TablePicker from "./table-picker"
import { render, screen } from "@testing-library/react"

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    database: "heavyai"
  }),
  useRouteMatch: () => ({ params: { database: "heavyai" } })
}))

describe("TablePicker Component", () => {
  const props = {
    tables: {
      list: [{ name: "first_table" }, { name: "second_table" }],
      tablePickerState: {
        searchVal: "",
        selectedPreviewTable: {
          index: null,
          name: null
        }
      }
    },
    gotoTableImporter: () => {},
    updateSearchVal: () => {},
    selectPreviewTable: () => {},
    resetPreviewTable: () => {},
    getDataSourcesList: () => {},
    canCreateTable: true
  }

  describe("will mount", () => {
    it("should render successfully", () => {
      render(<TablePicker {...props} />)

      expect(screen.getByTestId(/table-picker-container/)).toBeInTheDocument()
    })
  })
})
