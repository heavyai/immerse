// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import CompressedFileIcon from "./icon-compressed-file"

describe("<CompressedFileIcon /> component", () => {
  it("should render a component", () => {
    const { container } = render(<CompressedFileIcon />)
    expect(container.firstChild).not.toBeEmpty()
    expect(container.firstChild.tagName).toBe("svg")
  })
})
