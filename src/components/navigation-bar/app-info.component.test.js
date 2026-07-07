// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import AppInfo, { appInfoSpecsTestId, appInfoContentTestId } from "./app-info"
import { renderWithRedux } from "jest/renderScaffolding"
import "@testing-library/jest-dom/extend-expect"

describe("App Info", () => {
  describe("normal render", () => {
    const props = {
      appVersion: "3.0.0",
      coreVersion: "3.0.0",
      isRenderingEnabled: true
    }
    const state = {
      connection: {
        user: {
          customStyles: {}
        },
        serversJsonPending: true
      }
    }

    let component = null

    beforeEach(() => {
      component = <AppInfo {...props} />
    })

    it("should render the component", () => {
      const { getByTestId } = renderWithRedux(component, null, state)
      expect(getByTestId(appInfoContentTestId)).toBeTruthy()
      expect(getByTestId(appInfoContentTestId).tagName).toBe("DIV")
    })

    it("should render three list elements with full props", () => {
      const { getByTestId } = renderWithRedux(component, null, state)
      expect(
        getByTestId(appInfoSpecsTestId).querySelectorAll("li").length
      ).toBe(3)
    })

    it("should show backend rendering enabled", () => {
      const { getByText } = renderWithRedux(component, null, state)
      expect(getByText("Backend Rendering Enabled")).toBeInTheDocument()
    })

    it("should show backend rendering is disabled", () => {
      const falseBackendRenderingProps = Object.assign({}, props, {
        isRenderingEnabled: false
      })
      const { getByText } = renderWithRedux(
        <AppInfo {...falseBackendRenderingProps} />,
        null,
        state
      )
      expect(getByText("Backend Rendering Disabled")).toBeInTheDocument()
    })
  })

  describe("undefined props render", () => {
    const nullProps = {
      appVersion: undefined,
      coreVersion: undefined,
      isRenderingEnabled: undefined
    }

    const state = {
      connection: {
        user: {
          customStyles: {}
        },
        serversJsonPending: true
      }
    }

    let component = null

    beforeEach(() => {
      component = <AppInfo {...nullProps} />
    })

    it("should render the component", () => {
      const { getByTestId } = renderWithRedux(component, null, state)
      expect(getByTestId(appInfoContentTestId)).toBeTruthy()
      expect(getByTestId(appInfoContentTestId).tagName).toBe("DIV")
    })

    it("should render no list elements with undefined props", () => {
      const { getByTestId } = renderWithRedux(component, null, state)
      expect(
        getByTestId(appInfoSpecsTestId).querySelectorAll("li").length
      ).toBe(0)
    })
  })
})
