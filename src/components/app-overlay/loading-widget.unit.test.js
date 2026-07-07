// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import LoadingWidget from "./loading-widget"
import { render, screen } from "@testing-library/react"

describe("LoadingWidget", () => {
  it("should render the message", () => {
    render(<LoadingWidget message={"TEST"} />)
    expect(screen.getByText("TEST")).toBeInTheDocument()
  })
})
