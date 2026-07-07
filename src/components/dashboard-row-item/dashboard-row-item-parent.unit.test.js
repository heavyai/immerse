// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import proxyquire from "proxyquire"

const deleteDashboardMock = (name) => name

const { primaryAction, mapStateToProps } = proxyquire(
  "./dashboard-row-item-parent",
  {
    "actions/dashboards-action-creator": {
      deleteDashboard: deleteDashboardMock
    }
  }
)

import { hideModal } from "actions/ui-action-creators"

describe("DashboardRowItem Parent", () => {
  describe("primaryAction", () => {
    const dispatch = jest.fn()
    const name = "TEST"
    beforeEach(() => {
      const action = primaryAction(dispatch, name)
      action()
    })
    it("should dispatch hideModal", () => {
      expect(dispatch).toHaveBeenCalledWith(hideModal())
    })
  })

  describe("mapStateToProps", () => {
    describe("isPendingDelete prop", () => {
      it("should be true if delete view is equal to viewname and dashboard deleting is done", () => {
        const name = "TEST"
        const state = {
          connection: {
            user: {
              username: "heavyai"
            }
          },
          dashboards: {
            delete: {
              view: name,
              done: true
            }
          }
        }
        const props = {
          dashboard_metadata: "[0]",
          dashboard_name: name
        }
        const { isPendingDelete } = mapStateToProps(state, props)
        expect(isPendingDelete).toEqual(true)
      })
    })
  })
})
