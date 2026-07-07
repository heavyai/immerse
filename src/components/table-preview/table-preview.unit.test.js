// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import TablePreview from "components/table-preview/table-preview"
import { numberWithCommas } from "utils/helpers"

describe("TablePreview Component", () => {
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
    rowsRejected: 0,
    numberWithCommas
  }

  it("should call requestTablePreview on mount", () => {
    props.requestTablePreview = jest.fn()
    render(<TablePreview {...props} />)
    expect(props.requestTablePreview).toHaveBeenCalled()
  })

  it("should render correct number of rows", () => {
    const { container } = render(<TablePreview {...props} />)
    const numRows = container.querySelectorAll(".table-column-row").length - 1
    expect(props.fields.length).toEqual(numRows)
  })
})
