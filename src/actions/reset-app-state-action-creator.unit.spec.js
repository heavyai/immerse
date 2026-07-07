// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"

chai.use(spies)

import resetAppState from "./reset-app-state-action-creator"
import { RESET_APP_STATE } from "constants/action-types"

const dispatch = sinon.spy()
const charts = [createChart(), createChart()]
const dc = {
  chartRegistry: {
    list: sinon.spy(() => charts)
  },
  deregisterAllCharts: sinon.spy(),
  resetState: sinon.spy()
}

function createChart() {
  return {
    on: sinon.spy(),
    filterAll: sinon.spy(),
    resetSvg: sinon.spy(),
    destroyChart: sinon.spy()
  }
}

function run(thunk) {
  const services = new Map()
  services.set("dc", dc)
  thunk(dispatch, null, services)
}

describe("resetAppState Action Creator", () => {
  it("should teardown all charts", () => {
    run(resetAppState())
    charts.forEach(chart => {
      expect(chart.on).to.have.been.calledWith("filtered", null)
      expect(chart.filterAll).to.have.been.called
      expect(chart.resetSvg).to.have.been.called
      expect(chart.destroyChart).to.have.been.called
    })
  })
  it("should deregister all charts", () => {
    expect(dc.deregisterAllCharts).to.have.been.called
  })
  it("should reset DC state", () => {
    expect(dc.resetState).to.have.been.called
  })
  it("should dispatch RESET_APP_STATE", () => {
    expect(dispatch).to.have.been.calledWith({ type: RESET_APP_STATE })
  })
})
