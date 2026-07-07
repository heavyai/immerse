// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Router } from "react-router-dom"
import { render, fireEvent } from "@testing-library/react"
import DashboardRowItem from "./dashboard-row-item"
import history from "services/history"

describe("DashboardRowItem", () => {
  const baseProps = {
    isPendingDelete: false,
    owner: "ME",
    searchVal: "",
    tableName: "TEST TABLE",
    update_time: "2019-07-15 13:41:08",
    id: 1,
    dashboard_name: "EXAMPLE",
    dashboard_metadata: "{}",
    toggle: jest.fn()
  }

  const renderRowItem = (overrideProps = {}) => {
    const props = { ...baseProps, ...overrideProps }
    history.push("/")
    return render(
      <Router history={history}>
        <DashboardRowItem {...props} />
      </Router>
    )
  }

  describe("on delete button click", () => {
    it("should invoke deleteClick", () => {
      const showDeleteDashboardModal = jest.fn()
      const { getByTestId } = renderRowItem({ showDeleteDashboardModal })

      fireEvent.click(getByTestId("dashboard-action-delete-button-1"))
      expect(showDeleteDashboardModal).toHaveBeenCalled()
    })
  })
})
