// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { renderWithRedux } from "jest/renderScaffolding"
import { MemoryRouter } from "react-router-dom"
import { CONTROL_PANEL_ADMIN } from "constants/immerse-roles"
import SettingsNavList from "./settings-nav-list"

describe("<SettingsNavList />", () => {
  let defaultState
  beforeEach(() => {
    defaultState = {
      connection: { isSuperuser: true, roles: [] }
    }
  })

  const renderWithRouter = () => {
    return renderWithRedux(
      <MemoryRouter>
        <SettingsNavList />
      </MemoryRouter>,
      null,
      defaultState
    )
  }

  const allSections = [
    "Users",
    "Roles",
    "Feature Flags",
    "System Dashboards",
    "Log Files"
  ]

  test.each(allSections)("should render %s link for superusers", (section) => {
    const { queryByText } = renderWithRouter()
    expect(queryByText(section)).toBeInTheDocument()
  })

  test.each(allSections.filter((section) => section !== "Roles"))(
    "should render %s link for users with control panel admin role",
    (section) => {
      defaultState.connection.isSuperuser = false
      defaultState.connection.roles = [CONTROL_PANEL_ADMIN]
      const { queryByText } = renderWithRouter()

      expect(queryByText(section)).toBeInTheDocument()
    }
  )

  test("should not render Roles link for any non-superusers", () => {
    defaultState.connection.isSuperuser = false
    defaultState.connection.roles = [CONTROL_PANEL_ADMIN]
    const { queryByText } = renderWithRouter()
    expect(queryByText("Roles")).not.toBeInTheDocument()
  })

  test("should not render any links for non-superusers without control panel admin role", () => {
    defaultState.connection.isSuperuser = false
    const { queryByText } = renderWithRouter()
    const foundSection = allSections.some(
      (section) => queryByText(section) !== null
    )
    expect(foundSection).toBeFalsy()
  })
})
