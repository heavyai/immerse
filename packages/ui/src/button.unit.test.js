// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** @jest-environment jsdom */
const React = require("react")
const { render, fireEvent, cleanup } = require("@testing-library/react")
const { PrimaryButton, SecondaryButton } = require("./index")
afterEach(cleanup)
it("preserves labels, disabled behavior and click handlers behind the facade", () => {
  const click = jest.fn()
  const { getByRole, rerender } = render(
    React.createElement(PrimaryButton, { onClick: click }, "Apply")
  )
  fireEvent.click(getByRole("button", { name: "Apply" }))
  expect(click).toHaveBeenCalledTimes(1)
  rerender(
    React.createElement(
      SecondaryButton,
      { disabled: true, onClick: click },
      "Apply"
    )
  )
  fireEvent.click(getByRole("button", { name: "Apply" }))
  expect(click).toHaveBeenCalledTimes(1)
})
