// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import Table from "./table"

describe("Table", () => {
  beforeEach(() => {
    const defaultProps = {
      editableHeaders: false,
      handleUpdateDataType: jest.fn(),
      incomingFields: [],
      rows: []
    }

    render(<Table {...defaultProps} />)
  })

  it("should render simple table", () => {
    expect(screen.getByTestId("simple-table")).toBeInTheDocument()
  })
})
