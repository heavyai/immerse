// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import { ADD_CHART, GET_VIEW_AND_LOAD } from "constants/action-types"
import {
  getDashboard,
  mapStateToSerializedViewState,
  pickStateForViewState,
  saveDashboard,
  generateUniqueTitle
} from "actions/dashboard-action-creators"
import { addChart } from "actions/dashboard-layout-action-creators"

chai.use(spies)

describe("Dashboard Actions", () => {
  describe("addChart", () => {
    it("should return proper type and id in payload", () => {
      const action = addChart("1")
      expect(action).to.deep.equal({
        type: ADD_CHART,
        payload: { id: "1" }
      })
    })
  })

  describe("getDashboard Action", () => {
    it("should return proper action type", () => {
      expect(getDashboard(123)).to.deep.equal({
        type: GET_VIEW_AND_LOAD,
        id: 123,
        selectedTabId: undefined,
        selectedFilterSetId: undefined,
        parametersFromQueryString: undefined
      })
    })
  })

  describe("saveDashboard Action", () => {
    let dispatch
    const title = "allthecharts"
    const titleFormatted = "allthecharts"
    const dataSources = { TEST: {} }
    const filters = [{ error: false }]
    let getState = () => ({
      dashboard: { title, titleFormatted, dataSources },
      filters
    })
    const resolve = () => new Promise((resolve) => resolve())
    const reject = () => new Promise((resolve, reject) => reject())
    const task = saveDashboard()

    beforeEach(() => {
      dispatch = sinon.spy()
    })

    describe("when succeeds", () => {
      const services = new Map()
      services.set("DbCon", {
        createDashboardAsync: sinon.spy(() => resolve())
      })

      it("should dispatch request and success", () => {
        const serializedAndBase64State = mapStateToSerializedViewState(
          getState()
        )

        return task(dispatch, getState, services).then(() => {
          const actionSpy = services.get("DbCon").createDashboardAsync
          expect(actionSpy).to.have.been.calledWith(
            title,
            serializedAndBase64State,
            null,
            JSON.stringify({
              table: "TEST",
              version: "v3",
              dashboard_name_formatted: titleFormatted
            })
          )
          expect(dispatch).to.have.been.calledThrice
          expect(dispatch).to.have.been.calledWith({
            type: "SAVE_DASHBOARD_REQUEST"
          })
        })
      })

      it("should remove bad error dashboard filters on success", () => {
        getState = () => ({
          dashboard: { title, titleFormatted, dataSources },
          filters: [{ error: true }]
        })
        const serializedAndBase64State = mapStateToSerializedViewState(
          getState()
        )

        return task(dispatch, getState, services).then(() => {
          expect(
            services.get("DbCon").createDashboardAsync
          ).to.have.been.calledWith(
            title,
            serializedAndBase64State,
            null,
            JSON.stringify({
              table: "TEST",
              version: "v3",
              dashboard_name_formatted: titleFormatted
            })
          )

          expect(dispatch).to.have.been.calledThrice
          expect(dispatch).to.have.been.calledWith({
            type: "SAVE_DASHBOARD_REQUEST"
          })
        })
      })
    })

    describe("when fails", () => {
      const services = new Map()
      services.set("DbCon", {
        createDashboardAsync: () => reject()
      })

      it("should dispatch request and error", () =>
        task(dispatch, getState, services).then(() => {
          expect(dispatch).to.have.been.calledThrice
          expect(dispatch).to.have.been.calledWith({
            type: "SAVE_DASHBOARD_REQUEST"
          })
          expect(dispatch).to.have.been.calledWith({
            type: "SAVE_DASHBOARD_ERROR",
            error: undefined
          })
        }))
    })
  })

  describe("pickStateForViewState", () => {
    const reduxState = {
      app: {},
      chartEditor: {},
      charts: {},
      connection: {
        version: "2.2.1dev-20170321-cfaf680"
      },
      dashboard: {
        columnMetadata: "LOTSA DUMB INFORMATION THAT WE SHOULD NOT SAVE",
        saveState: {
          lastState: "NOTHING WE SHOULD SAVE"
        }
      },
      dashboards: {},
      dc: {},
      autosuggest: {},
      filters: [{ error: true }, { error: false }],
      importer: {},
      routing: {},
      tables: {},
      ui: {}
    }

    it("should add version number to dashboard", () => {
      const result = pickStateForViewState(reduxState)
      expect(result.dashboard.version).to.eql("2.2.1dev-20170321-cfaf680")
    })

    it("should only select charts, filters, dashboard", () => {
      const result = pickStateForViewState(reduxState)
      expect(result.charts).to.deep.equal({})
      expect(result.filters).to.deep.equal([{ error: false }])
      expect(result.dashboard.version).to.deep.equal(
        "2.2.1dev-20170321-cfaf680"
      )
      expect(result.ui).to.deep.equal(undefined)
      expect(result.tables).to.deep.equal(undefined)
      expect(result.app).to.deep.equal(undefined)
    })

    it("should not select dashboard.saveState.lastState", () => {
      const result = pickStateForViewState(reduxState)
      expect(result.dashboard.saveState.lastState).to.deep.equal(undefined)
    })

    it("should remove columnMetadata from dashboard", () => {
      const result = pickStateForViewState(reduxState)
      expect(result.dashboard.columnMetadata).to.eql(undefined)
    })

    it("should remove all filters with error state", () => {
      const result = pickStateForViewState(reduxState)
      expect(result.filters.length).to.eql(1)
    })
  })

  describe("generateUniqueTitle()", () => {
    const dashboardList = [
      {
        dashboard_name: "foo"
      },
      {
        dashboard_name: "bar"
      },
      {
        dashboard_name: "baz"
      }
    ]
    it("should return `${title} (Copy)` for single dashboard", () => {
      const dashTitle = dashboardList[1].dashboard_name
      expect(
        generateUniqueTitle("Copy")(dashTitle, dashboardList, "dashboard_name")
      ).to.eq(`${dashTitle} (Copy)`)
    })
    it("should return `${title} (Copy 1)` for existing dashboard copy", () => {
      const newList = [
        ...dashboardList,
        {
          dashboard_name: "foo (Copy)"
        }
      ]
      const dashTitle = newList[0].dashboard_name
      expect(
        generateUniqueTitle("Copy")(dashTitle, newList, "dashboard_name")
      ).to.eq(`${dashTitle} (Copy 1)`)
    })
    it("should return `${title} (Copy [n + 1])` for n existing dashboard copies", () => {
      const newList = [
        ...dashboardList,
        {
          dashboard_name: "foo (Copy)"
        },
        {
          dashboard_name: "foo (Copy 1)"
        }
      ]
      const dashTitle = newList[0].dashboard_name
      expect(
        generateUniqueTitle("Copy")(dashTitle, newList, "dashboard_name")
      ).to.eq(`${dashTitle} (Copy 2)`)
    })
    it("should return `${title} (Copy) (Copy)` for copy of copy", () => {
      const newList = [
        ...dashboardList,
        {
          dashboard_name: "foo (Copy)"
        }
      ]
      const dashTitle = newList[newList.length - 1].dashboard_name
      expect(
        generateUniqueTitle("Copy")(dashTitle, newList, "dashboard_name")
      ).to.eq(`${dashTitle} (Copy)`)
    })
    it("should return `${title} (Copy) (Copy [n + 1])` for copy of existing copy", () => {
      const newList = [
        ...dashboardList,
        {
          dashboard_name: "foo (Copy)"
        },
        {
          dashboard_name: "foo (Copy) (Copy 1)"
        }
      ]
      const dashTitle = newList[newList.length - 2].dashboard_name
      expect(
        generateUniqueTitle("Copy")(dashTitle, newList, "dashboard_name")
      ).to.eq(`${dashTitle} (Copy 2)`)
    })
  })
})
