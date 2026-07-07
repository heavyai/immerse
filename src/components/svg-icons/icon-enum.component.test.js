// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import IconEnum from "./icon-enum"

describe("<IconEnum /> component", () => {
  it("should render a component", () => {
    const { container } = render(<IconEnum />)
    expect(container.firstChild).not.toBeEmpty()
    expect(container.firstChild.tagName).toBe("svg")
  })
})
