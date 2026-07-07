// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import {
  SQLEditorExecute,
  SQLEditorExecuteRequest,
  SQLEditorExecuteSuccess,
  SQLEditorExecuteError
} from "./sql-editor-action-creators"

chai.use(spies)

const queryResult = {
  results: [],
  timing: {
    execution_time_ms: 0
  }
}

const timestamp = 1584548961577

let dispatch = null

const DbCon = {
  queryAsync(string, options, cb) {
    return Promise.resolve(queryResult)
  }
}

const services = new Map()
services.set("DbCon", DbCon)

function run(thunk) {
  return thunk(dispatch, () => { }, services)
}

describe("SQLEditorExecute", () => {
  beforeEach(() => {
    dispatch = sinon.spy()
  })

  describe("when SELECT query", () => {
    it("should return the correct type of result", () => {
      const query = "SELECT * FROM Test_table LIMIT 1000"
      return run(SQLEditorExecute(query, timestamp)).then(() => {
        expect(dispatch).to.have.been.calledWith(
          SQLEditorExecuteSuccess(false, query, queryResult, timestamp)
        )
      })
    })

    it("should return the correct type of result with whitespace at the start of the query", () => {
      const query = " SELECT * FROM Test_table LIMIT 1000"
      const trimmedQuery = "SELECT * FROM Test_table LIMIT 1000"
      return run(SQLEditorExecute(query, timestamp)).then(() => {
        expect(dispatch).to.have.been.calledWith(
          SQLEditorExecuteSuccess(false, trimmedQuery, queryResult, timestamp)
        )
      })
    })
  })

  describe("when SELECT query with no LIMIT", () => {
    it("should apply LIMIT if starts with SELECT", () => {
      const query = "SELECT * FROM Test_table;"
      const queryLimited = "SELECT * FROM Test_table LIMIT 1000;"

      return run(SQLEditorExecute(query, timestamp)).then(() => {
        expect(dispatch).to.have.been.calledWith(
          SQLEditorExecuteSuccess(false, queryLimited, queryResult, timestamp)
        )
      })
    })
  })
})
