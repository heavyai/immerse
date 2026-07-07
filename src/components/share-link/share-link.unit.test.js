// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import ShareLink from "./share-link"

describe("ShareLink Component", () => {
  const props = {
    formattedLink: "http://www.heavy.ai/#/link/heavyai/8dj3f",
    initializeDashboardSharingModal: jest.fn()
  }

  describe("initial render", () => {
    it("should instantiate with popover not showing", () => {
      render(<ShareLink {...props} />)
      expect(screen.queryByTestId("share-link-popover")).toBeNull()
    })

    it("should set showLink to true when Share clicked and show popover", () => {
      render(<ShareLink {...props} />)
      fireEvent.click(screen.getByTestId("dashboard-share"))
      expect(props.initializeDashboardSharingModal).toHaveBeenCalled()
    })
  })
})
