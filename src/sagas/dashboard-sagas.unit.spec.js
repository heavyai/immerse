// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import { expectSaga, testSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"
import Services from "services/immerse"
import CrossFilter from "services/ImmerseCrossFilter"
import { setColumnMetadata } from "actions/dashboard-action-creators"
import { getView } from "./dashboard-sagas"
import { deserialize } from "utils/dashboard-load"
import proxyquire from "proxyquire"
import action from "utils/redux/action"
import * as ActionTypes from "constants/action-types"
import * as ModalTypes from "constants/modal-types"
import { deleteAllCohorts } from "components/new-filters/cohorts-action-creators"

chai.use(spies)

const DASHBOARD_STATE = {
  connection: {},
  dashboard: {
    dataSources: {
      flights: {},
      tweets: {}
    },
    streaming: {
      interval: 0,
      request: false
    }
  },
  filters: [],
  router: {
    location: {
      pathname:"/heavy/dashboard/123",
      search:"?tab=abc"
    }
  },
  tables: []
}

const mockConnector = {
  getFields(name, callback) {
    setTimeout(() => callback(null, []), 0)
  },
  query(stmt, opt, callback) {
    callback(null, [{}])
  },
  getDbObjectPrivsAsync(table, type) {
    return Promise.resolve([{ privs: [false, false, true] }])
  },
  getDashboardAsync(id) {
    return Promise.resolve({
      dashboard_state: DASHBOARD_STATE,
      dashboard_id: id,
      dashboard_owner: "heavyai"
    })
  },

}

const mockDC = {
  resetState: sinon.spy(),
  chartRegistry: {
    listAll: sinon.spy(() => {
      return [
        {
          on: sinon.spy(),
          removeMapListeners: sinon.spy(),
          filterAll: sinon.spy(),
          resetSvg:  sinon.spy(),
          destroyChart: sinon.spy()
        }
      ]
    }),
  },
  deregisterAllCharts: sinon.spy()
}

const flightColumns = ["a", "b", "c"]

const flightCF = {
  setGlobalFilter: sinon.spy(),
  getColumns: sinon.spy(() => flightColumns),
  sizeAsync: sinon.spy()
}

const tweetColumns = ["a", "b", "c"]

const tweetCF = {
  setGlobalFilter: sinon.spy(),
  getColumns: sinon.spy(() => tweetColumns),
  sizeAsync: sinon.spy()
}

describe("initializeDashboard Saga", () => {
  const connector = Services.get("DbCon")
  const dc = Services.get("dc")
  const {initializeDashboard} = proxyquire("sagas/dashboard-sagas", {
    "actions/privileges-thunks": {
      getDataSourcePrivileges: async function() {
        return {
          create: true,
          drop: true,
          select: true,
          insert: true,
          update: true,
          delete: true,
          truncate: true,
          alter: true,
        }
      }
    }
  })

  before(() => {
    Services.set("DbCon", mockConnector)
    Services.set("dc", mockDC)
  })

  after(() => {
    Services.set("DbCon", connector)
    Services.set("dc", dc)
  })

  /*

  // ImmerseCrossFilter breaks this test. Disable it until we learn enough about expectSaga to fix it.

  it("should setColumnMetadata and reset dc state", () => {
    return expectSaga(initializeDashboard)
      .withState(DASHBOARD_STATE)
      .provide([
        [
          matchers.call.fn(CrossFilter.crossfilter, mockConnector, "flights"),
          flightCF
        ],
        [
          matchers.call.fn(CrossFilter.crossfilter, mockConnector, "tweets"),
          tweetCF
        ]
      ])
      .put(setColumnMetadata("tweets", tweetColumns))
      .put(setColumnMetadata("flights", flightColumns))
      .run()
      .then(() => {
        expect(mockDC.resetState).to.have.been.called
      })
  })

  */
})

const mockedThunkResult = () => {
  /* No op */
}

const mockedThunk = () => mockedThunkResult

describe("getView", () => {
  const connector = Services.get("DbCon")
  const dc = Services.get("dc")

  before(() => {
    Services.set("DbCon", mockConnector)
    Services.set("dc", mockDC)
  })

  after(() => {
    Services.set("DbCon", connector)
    Services.set("dc", dc)
  })

  const view = {
    dashboard: {
      dataSources: {
        flights: {}
      },
      filters: [],
      omnifilters: []
    },
    charts: {},
    filters: [],
    omnifilters: [],
    filterZones: {
      "-LrtloSTW6vQzDCRjP5M": {
        filters: []
      }
    }
  }

  it("should do nothing if dashboard already loaded", () => {
    const id = 123
    const state = {
      ...DASHBOARD_STATE,
      dashboard: {
        ...DASHBOARD_STATE.dashboard,
        id
      }
    }

    return testSaga(getView, { id })
      .next()
      .select()
      .next(state)
      .isDone()
  })

})
