// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

chai.use(spies)

import * as ActionTypes from "constants/action-types"
import * as TablesReferenceActions from "actions/tables-reference-action-creators"

describe("Tables Reference Action Creators", () => {
  describe("addTablesRequest", () => {
    it("should return the ADD_TABLES_REQUEST action type", () => {
      const action = TablesReferenceActions.addTablesRequest()
      expect(action.type).to.eql(ActionTypes.ADD_TABLES_REF_REQUEST)
    })
  })

  describe("addTablesSuccess", () => {
    it("should return the ADD_TABLES_SUCCESS action type", () => {
      const tables = [{ name: "flights" }, { name: "tweets" }]
      const action = TablesReferenceActions.addTablesSuccess(tables)
      expect(action.type).to.eql(ActionTypes.ADD_TABLES_REF_SUCCESS)
      expect(action.tablesReference).to.deep.equal(tables)
    })
  })

  describe("addTablesError", () => {
    it("should return the ADD_TABLES_REF_ERROR action type", () => {
      const action = TablesReferenceActions.addTablesError()
      expect(action.type).to.eql(ActionTypes.ADD_TABLES_REF_ERROR)
    })
  })

  describe("getDataSourcesList", () => {
    let dispatch
    let dispatched = []
    const tables = [1, 2, 3, 4, 5]
    const services = new Map()
    const resolve = () => new Promise(resolve => resolve(tables))
    const reject = () => new Promise((resolve, reject) => reject())

    beforeEach(() => {
      dispatched = []
      dispatch = sinon.spy(a => dispatched.push(a))
    })

    it("should dispatch request and success on promise success", () => {
      services.set("DbCon", { getTablesAsync: resolve })
      const task = TablesReferenceActions.getTables()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesReferenceActions.addTablesRequest(),
          TablesReferenceActions.addTablesSuccess(tables)
        ])
      })
    })

    it("should dispatch request and error on promise error", () => {
      services.set("DbCon", { getTablesAsync: reject })
      const task = TablesReferenceActions.getTables()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesReferenceActions.addTablesRequest(),
          TablesReferenceActions.addTablesError()
        ])
      })
    })
  })
})
