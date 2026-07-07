// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

chai.use(spies)

import * as ActionTypes from "constants/action-types"
import * as TablesActions from "actions/tables-action-creators"

describe("Tables Action Creators", () => {
  describe("startDataManagerRequest", () => {
    it("should return the START_TABLES_REQUEST action type", () => {
      const action = TablesActions.startDataManagerRequest()
      expect(action.type).to.eql(ActionTypes.START_TABLES_REQUEST)
    })
  })

  describe("addTablesSuccess", () => {
    it("should return the ADD_TABLES_SUCCESS action type", () => {
      const tables = [{ name: "flights" }, { name: "tweets" }]
      const action = TablesActions.addTablesSuccess(tables)
      expect(action.type).to.eql(ActionTypes.ADD_TABLES_SUCCESS)
      expect(action.tables).to.deep.equal(tables)
    })
  })

  describe("addTablesWithMetaSuccess", () => {
    it("should return the ADD_TABLES_WITH_META_SUCCESS action type", () => {
      const tablesWithMeta = [{ name: "flights" }, { name: "tweets" }]
      const action = TablesActions.addTablesWithMetaSuccess(tablesWithMeta)
      expect(action.type).to.eql(ActionTypes.ADD_TABLES_WITH_META_SUCCESS)
      expect(action.tablesWithMeta).to.deep.equal(tablesWithMeta)
    })
  })

  describe("addTablesError", () => {
    it("should return the TABLES_TRANSACTION_ERROR action type", () => {
      const action = TablesActions.dataManagerTransactionError({
        message: "there was an error"
      })
      expect(action.type).to.eql(ActionTypes.TABLES_TRANSACTION_ERROR)
    })
  })

  describe("getDataSourcesList", () => {
    let dispatch
    let dispatched = []
    const tables = [{ name: "flights" }, { name: "tweets" }]
    const services = new Map()
    const resolve = () => new Promise(resolve => resolve(tables))
    const reject = () => new Promise((resolve, reject) => reject({}))
    const getCustomExpressionsAsync = () => Promise.resolve([])

    beforeEach(() => {
      dispatched = []
      dispatch = sinon.spy(a => dispatched.push(a))
    })

    it("should dispatch request and success on promise success", () => {
      services.set("DbCon", { getTablesAsync: resolve, getCustomExpressionsAsync })
      const task = TablesActions.getDataSourcesList()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesActions.startDataManagerRequest(),
          TablesActions.addTablesSuccess(tables, [])
        ])
      })
    })

    it("should dispatch request and error on promise error", () => {
      services.set("DbCon", { getTablesAsync: reject, getCustomExpressionsAsync })
      const task = TablesActions.getDataSourcesList()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesActions.startDataManagerRequest(),
          TablesActions.dataManagerTransactionError({})
        ])
      })
    })
  })

  describe("getTablesWithMeta", () => {
    let dispatch
    let dispatched = []
    const tables = [1, 2, 3, 4, 5]
    const services = new Map()
    const resolve = () => new Promise(resolve => resolve(tables))
    const reject = () => new Promise((resolve, reject) => reject({}))

    beforeEach(() => {
      dispatched = []
      dispatch = sinon.spy(a => dispatched.push(a))
    })

    it("should dispatch request and success on promise success", () => {
      services.set("DbCon", { getTablesWithMetaAsync: resolve })
      const task = TablesActions.getTablesWithMeta()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesActions.startDataManagerRequest(),
          TablesActions.addTablesWithMetaSuccess(tables)
        ])
      })
    })

    it("should dispatch request and error on promise error", () => {
      services.set("DbCon", { getTablesWithMetaAsync: reject })
      const task = TablesActions.getTablesWithMeta()
      return task(dispatch, null, services).then(() => {
        expect(dispatched).to.deep.equal([
          TablesActions.startDataManagerRequest(),
          TablesActions.dataManagerTransactionError({})
        ])
      })
    })
  })
})
