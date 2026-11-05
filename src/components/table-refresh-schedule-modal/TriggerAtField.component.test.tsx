// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import TriggerAtField from "./TriggerAtField"

it("edits local scheduled times and clears to null", () => {
  const onChange = jest.fn()
  render(
    <TriggerAtField
      id="schedule"
      value={new Date(2026, 10, 5, 12, 15, 30, 123)}
      onChange={onChange}
    />
  )
  const input = screen.getByLabelText("Choose date and time")
  expect(input).toHaveValue("2026-11-05T12:15:30.123")
  fireEvent.change(input, { target: { value: "2026-11-06T14:25:35.456" } })
  expect(onChange).toHaveBeenLastCalledWith(
    new Date(2026, 10, 6, 14, 25, 35, 456)
  )
  fireEvent.change(input, { target: { value: "" } })
  expect(onChange).toHaveBeenLastCalledWith(null)
})
