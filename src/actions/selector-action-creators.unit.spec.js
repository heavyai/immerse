// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

import Services from "services/immerse"
import { customDimension, customMeasure } from "actions/custom-selector-thunks"

chai.use(spies)

describe("SelectorActionCreators", () => {
  const connector = Services.get("DbCon")

  after(() => {
    Services.set("DbCon", connector)
  })

  const getState = () => ({
    dashboard: {
      table: "fooTable"
    },
    charts: {
      1: {
        dataSource: "fooTable"
      }
    }
  })

  describe("customDimension", () => {
    it("gets column type and dispatches addDimension", () => {
      const dispatch = sinon.spy()

      Services.set("DbCon", {
        validateQuery() {
          return Promise.resolve()
        }
      })

      return customDimension(
        1,
        "line",
        0,
        {},
        1
      )(dispatch, getState).then(() => {
        expect(dispatch).to.have.been.called.with.a("function")
      })
    })

    it("dispatches a dimension in error state when get column type rejects", () => {
      const dispatch = sinon.spy()

      Services.set("DbCon", {
        validateQuery() {
          return Promise.reject()
        }
      })

      return customDimension(
        1,
        "line",
        0,
        {},
        1
      )(dispatch, getState).then(() => {
        expect(dispatch.callCount).to.eq(4)
      })
    })
  })

  describe("customMeasure", () => {
    it("gets column type and dispatches addDimension", () => {
      const dispatch = sinon.spy()

      Services.set("DbCon", {
        validateQuery() {
          return Promise.resolve()
        }
      })

      return customMeasure(
        1,
        "line",
        0,
        {},
        1
      )(dispatch, getState).then(() => {
        expect(dispatch).to.have.been.called.with.a("function")
      })
    })

    it("dispatches a measure in error state when get column type rejects", () => {
      const d = sinon.spy()

      Services.set("DbCon", {
        validateQuery() {
          return Promise.reject()
        }
      })

      return customMeasure(
        1,
        "line",
        0,
        {},
        1
      )(d, getState).then(() => {
        expect(d.callCount).to.eq(4)
      })
    })
  })
})
