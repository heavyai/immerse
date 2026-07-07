// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import { ShareLinkPopover } from "./share-link-popover"

jest.mock("copy-to-clipboard", () => {
  return jest.fn()
})

describe("ShareLinkPopover Component", () => {
  const order = []
  const props = {
    shouldShowSuccessMsg: false,
    formattedLink: "http://www.heavy.ai/#/link/heavyai/8dj3f",
    showSuccessMsg: jest.fn(() => order.push("show")),
    hideSuccessMsg: jest.fn(() => order.push("hide"))
  }

  describe("initial render", () => {
    it("should run highlight text when clicking on share-link-copy-btn", () => {
      render(<ShareLinkPopover {...props} />)
      fireEvent.click(screen.getByTestId("dashboard-share-copy"))
      expect(screen.getByDisplayValue(props.formattedLink)).toBeInTheDocument()
    })
  })
})
