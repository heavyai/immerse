// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"

import Lock from "./lock"

describe("Lock Component", () => {
  it("calls onLockedChange prop when clicked", () => {
    const onLockedChange = jest.fn()
    const { container } = render(
      <Lock locked={false} onLockedChange={onLockedChange} />
    )

    const rootDiv = container.querySelector("div")
    fireEvent.click(rootDiv)

    expect(onLockedChange).toHaveBeenCalled()
  })
})
