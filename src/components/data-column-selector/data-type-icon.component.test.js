// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import DataTypeIcon from "./data-type-icon"
import { DATA_TYPE_CATEGORY } from "./constants"

describe("<DataTypeIcon /> component", () => {
  it("should render a component based on a data type", () => {
    const { container } = render(
      <DataTypeIcon type={DATA_TYPE_CATEGORY.DATE_TIME} />
    )
    expect(container.firstChild).not.toBeEmpty()
    expect(container.firstChild.tagName).toBe("svg")
  })
  it("should throw an error if there is no type passed in", () => {
    const renderFn = () => render(<DataTypeIcon />)
    expect(renderFn).toThrow()
  })
})
