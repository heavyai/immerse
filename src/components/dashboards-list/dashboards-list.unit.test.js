// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import {
  DashboardsList,
  makeListComparator,
  handleUntitledDashboard,
  makeSearchFilter
} from "./dashboards-list"

describe("DashboardsList Component", () => {
  describe("DashboardsList", () => {
    it("with no list or searchVal gives option for new dash", () => {
      const { container, getByText } = render(
        <DashboardsList
          list={[]}
          initializeDashboard={() => {}}
          searchVal=""
          canCreateDashboard
          filters={[]}
          updateFilteredListCount={() => {}}
          selected={new Set()}
          toggleDashboard={() => {}}
          selectAllDashboardsInList={() => {}}
          deselectAllDashboardsInList={() => {}}
          filterEnabled={false}
          sharingEnabled={false}
        />
      )

      expect(getByText("No dashboard yet")).toBeInTheDocument()
      expect(
        container.querySelector(".dashboard-message span").textContent
      ).toBe('Click "New Dashboard" to create your first dashboard.')
    })

    it("with no list or searchVal and no canCreateDashboard, shows empty message", () => {
      const { getByText } = render(
        <DashboardsList
          list={[]}
          initializeDashboard={() => {}}
          searchVal=""
          filters={[]}
          updateFilteredListCount={() => {}}
          selected={new Set()}
          toggleDashboard={() => {}}
          selectAllDashboardsInList={() => {}}
          deselectAllDashboardsInList={() => {}}
          filterEnabled={false}
          sharingEnabled={false}
        />
      )

      expect(
        getByText("There are no dashboards available at this time.")
      ).toBeInTheDocument()
    })

    it("should sort list alphabetically", () => {
      const list = [
        {
          dashboard_name: "Test",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v3" })
        },
        {
          dashboard_name: "Apple",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v1" })
        }
      ]

      expect(list.sort(makeListComparator("dashboard_name", -1))).toStrictEqual(
        list.reverse()
      )
    })

    it("should sort list by time", () => {
      const list = [
        {
          dashboard_name: "Apple",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v3" }),
          update_time: "1"
        },
        {
          dashboard_name: "Test",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v1" }),
          update_time: "5"
        }
      ]
      expect(list.sort(makeListComparator("update_time", -1))).toStrictEqual(
        list.reverse()
      )
    })

    it("should handle untitleddashboard", () => {
      expect(handleUntitledDashboard("test")).toEqual("test")
      expect(handleUntitledDashboard("")).toEqual("Untitled")
    })

    it("should filter list by searchVal", () => {
      const list = [
        {
          dashboard_name: "Test",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v3" })
        },
        {
          dashboard_name: "Apple",
          dashboard_metadata: JSON.stringify({ title: "1", version: "v1" })
        }
      ]

      expect(list.filter(makeSearchFilter("apple"))).toStrictEqual([list[1]])
    })
  })
})
