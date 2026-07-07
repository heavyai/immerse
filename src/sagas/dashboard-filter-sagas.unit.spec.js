// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import { expectSaga } from "redux-saga-test-plan"
import { handleFilterStateChange } from "./dashboard-filter-sagas"
import Services from "services/immerse"

chai.use(spies)

describe("dashoard filter sagas", () => {
  describe("handleFilterStateChange", () => {
    const filterSpy = sinon.spy()

    before(() => {
      Services.set("crossfilter", {
        getCrossfilter: () => ({
          getGlobalFilter: () => ["dest = 'SFO'"]
        })
      })

      Services.set("newFilter", {
        setFilters: filterSpy
      })
    })

    it("should set new filter and redraw all", () => {
      return expectSaga(handleFilterStateChange, {
        index: 0,
        attributes: { operator: "=" }
      })
        .withState({
          connection: { isMSDEnabled: false },
          dashboard: { currentDataSource: "flights" },
          filters: [{ operator: "=" }, { operator: "<" }]
        })
        .run()
        .then(() => {
          expect(filterSpy).to.have.been.calledWith("flights", [
            { operator: "=" },
            { operator: "<" }
          ])
        })
    })
  })
})
