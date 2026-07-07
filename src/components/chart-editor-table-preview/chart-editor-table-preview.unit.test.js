// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import ChartEditorTablePreview from "components/chart-editor-table-preview/chart-editor-table-preview"
import { renderWithRedux } from "jest/renderScaffolding"
import { screen } from "@testing-library/react"

describe("<ChartEditorTablePreview />", () => {
  const props = {
    name: "flights",
    rowCount: {
      value: 10
    },
    fields: [
      {
        column: "column name",
        type: "column type",
        is_dict: false
      },
      {
        column: "column name",
        type: "column type",
        is_dict: false
      }
    ],
    error: false,
    loading: false,
    rowsRejected: 0
  }

  beforeEach(() => {
    props.requestTablePreview = jest.fn()
    props.numberWithCommas = jest.fn()

    renderWithRedux(<ChartEditorTablePreview {...props} />)
  })

  describe("will mount ", () => {
    it("should call requestTablePreview", () => {
      expect(props.requestTablePreview).toHaveBeenCalled()
    })
  })

  describe("render table preview", () => {
    it("should render correct number of rows", () => {
      const numRows = screen.queryAllByTestId("table-column-row").length
      expect(props.fields.length).toEqual(numRows)
    })
  })
})
