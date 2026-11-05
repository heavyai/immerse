// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import HoverSelectorRow from "./hover-selector-row"

it("removes the chosen popup column and hides removal for grouped columns", () => {
  const column = { value: "followers", label: "Followers", type: "STR" }
  const removeColumn = jest.fn()
  const props = {
    columnOption: column,
    removeColumn,
    connectDragSource: (node) => node,
    connectDropTarget: (node) => node
  }
  const { rerender } = render(<HoverSelectorRow {...props} />)
  fireEvent.click(screen.getByRole("button", { name: "Remove Followers" }))
  expect(removeColumn).toHaveBeenCalledWith(column)
  rerender(<HoverSelectorRow {...props} isGrouped />)
  expect(
    screen.queryByRole("button", { name: "Remove Followers" })
  ).not.toBeInTheDocument()
})
