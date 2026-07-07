// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import IconGeo from "./icon-geo"

describe("<IconGeo /> component", () => {
  it("should render a component", () => {
    const { container } = render(<IconGeo />)
    expect(container.firstChild).not.toBeEmpty()
    expect(container.firstChild.tagName).toBe("svg")
  })
})
