// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"

import EditableColumnHeader, { getDefaultWidth } from "./editable-column-header"

const props = {
  dispatch: jest.fn(),
  isNotValid: "it is not valid",
  columnName: "TEST",
  columnId: 0
}
describe("EditableColumnHeader", () => {
  describe("onSubmit", () => {
    beforeEach(() => {
      render(<EditableColumnHeader {...props} />)
    })

    describe("getDefaultWidth", () => {
      test("should extend length for a big word ", () => {
        const bigWord = getDefaultWidth(20)
        expect(bigWord).toEqual("170px")
      })
      test("should extend length for a small word ", () => {
        const smallWord = getDefaultWidth(1)
        expect(smallWord).toEqual("120px")
      })
    })
  })
  describe("testing IsNotValid prop", () => {
    test("should appear isNotValid message ", () => {
      render(<EditableColumnHeader {...props} />)
      expect(screen.getByText(/it is not valid/)).toBeInTheDocument()
    })
    test("should not appear isNotValid message ", () => {
      const newProps = {
        ...props,
        isNotValid: null
      }
      render(<EditableColumnHeader {...newProps} />)
      expect(screen.queryByText(props.isNotValid)).toBeNull()
    })
  })
})
