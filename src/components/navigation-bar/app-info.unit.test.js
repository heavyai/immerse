// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import AppInfo, { appInfoSpecsTestId } from "./app-info"

jest.mock("components/logo/logo", () => ({
  __esModule: true,
  default: () => <div data-testid="logo-mock" />
}))

describe("App Info", () => {
  describe("normal render", () => {
    const props = {
      appVersion: "3.0.0",
      coreVersion: "3.0.0",
      isRenderingEnabled: true
    }

    it("should render three list elements with full props", () => {
      const { getByTestId } = render(<AppInfo {...props} />)
      const list = getByTestId(appInfoSpecsTestId)
      expect(list.querySelectorAll("li")).toHaveLength(3)
    })

    it("should show backend rendering enabled", () => {
      const { getByTestId } = render(<AppInfo {...props} />)
      const list = getByTestId(appInfoSpecsTestId)
      const items = list.querySelectorAll("li")
      expect(items[2].textContent).toBe("Backend Rendering Enabled")
    })

    it("should full server version", () => {
      const fullCoreVersionProps = Object.assign({}, props, {
        coreVersion: "3.1.3dev-20170804-3ea4d54"
      })
      const { getByTestId } = render(<AppInfo {...fullCoreVersionProps} />)
      const list = getByTestId(appInfoSpecsTestId)
      const items = list.querySelectorAll("li")
      expect(items[1].textContent).toBe(
        `Core v${fullCoreVersionProps.coreVersion}`
      )
    })

    it("should show backend rendering is disabled", () => {
      const falseBackendRenderingProps = Object.assign({}, props, {
        isRenderingEnabled: false
      })
      const { getByTestId } = render(
        <AppInfo {...falseBackendRenderingProps} />
      )
      const list = getByTestId(appInfoSpecsTestId)
      const items = list.querySelectorAll("li")
      expect(items[2].textContent).toBe("Backend Rendering Disabled")
    })
  })

  describe("undefined props render", () => {
    const nullProps = {
      appVersion: undefined,
      coreVersion: undefined,
      isRenderingEnabled: undefined
    }

    it("should render no list elements with undefined props", () => {
      const { getByTestId } = render(<AppInfo {...nullProps} />)
      const list = getByTestId(appInfoSpecsTestId)
      expect(list.querySelectorAll("li")).toHaveLength(0)
    })
  })
})
