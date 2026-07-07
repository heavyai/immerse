// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { mount, shallow } from "enzyme"
import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import proxyquire from "proxyquire"

import { AppRoot } from "./application-root"

import { routerReducer } from "connected-react-router"
import { createStore } from "redux"
import { combineReducers } from "redux"
import connection from "reducers/connection"

chai.use(spies)

const setUserAgentSpy = sinon.spy()
const noop = () => {}

const reducers = combineReducers({
  routing: routerReducer,
  connection
})

const initialState = {
  charts: {},
  connection: {
    isConnected: true
  },
  routing: {
    locationBeforeTransitions: {
      pathname: null
    }
  },
  app: {},
  tables: {},
  dashboard: {
    loadState: {},
    saveState: {},
    saveLinkState: {}
  },
  dashboards: {
    list: [],
    delete: {}
  },
  importer: {},
  ui: {},
  dc: {
    initialRender: {}
  },
  children: []
}

const store = createStore(reducers, initialState)

store.dispatch = action => next => {
  if (typeof action === "function") {
    action(...store)
  } else {
    next(action)
  }
}

describe("Root Component", () => {
  describe("UNSAFE_componentWillMount", () => {
    before(() => {
      shallow(<AppRoot store={store} />)
    })
  })
})
