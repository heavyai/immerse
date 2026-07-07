// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SelectorPill } from "./selector-pill"

const props = {
  alias: "testAlias",
  aggType: "Custom",
  label: "testLabel",
  processedLabel: "testProcessedLabel",
  isDragging: true,
  shouldShowAggType: true,
  handleSelectorClick: jest.fn(),
  handleAggClick: jest.fn(),
  onRemoveClick: jest.fn(),
  inactive: true,
  makeDraggable: (a) => a,
  selectorType: "dimensions",
  binIntervalLabel: "",
  extract: false,
  isBinned: false,
  isError: false,
  isRequired: false,
  isTime: false,
  style: ""
}

const setup = () => {
  return render(<SelectorPill {...props} />)
}

describe("SelectorPill Component", () => {
  test("should show selector alias if there is a alias", () => {
    const { rerender } = setup()
    expect(screen.getByText(props.alias)).toBeInTheDocument()

    rerender(<SelectorPill {...props} alias={null} />)

    expect(screen.queryByText(props.alias)).not.toBeInTheDocument()
  })

  test("should show selector aggType if there is a aggType", () => {
    const { rerender } = setup()
    expect(screen.getByText(props.aggType)).toBeInTheDocument()

    rerender(<SelectorPill {...props} shouldShowAggType={false} />)

    expect(screen.queryByText(props.aggType)).not.toBeInTheDocument()
  })

  test("should show the selector label", () => {
    setup()
    expect(screen.getByText(props.processedLabel)).toBeInTheDocument()
  })

  test("should call handleAggClick on aggType and label click", () => {
    setup()
    userEvent.click(screen.getByText(props.aggType))
    userEvent.click(screen.getByTestId("column-selector-select-button"))

    expect(props.handleAggClick).toHaveBeenCalledTimes(1)
    expect(props.handleSelectorClick).toHaveBeenCalledTimes(1)
  })

  test("should call onRemoveClick on remove button icon click", () => {
    setup()
    userEvent.click(screen.getByTestId("column-selector-remove-button"))
    expect(props.onRemoveClick).toHaveBeenCalledTimes(1)
  })
})
