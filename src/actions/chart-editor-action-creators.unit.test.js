// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import { SAVE_CURRENT_CHART } from "constants/action-types"
import { saveCurrentChart } from "actions/chart-editor-action-creators"

const mockStore = configureStore([thunk])

describe("Chart editor action creators", () => {
  describe("Filters", () => {
    it("should save correct filters when chart level filters when dispatching saveCurrentChart", () => {
      const store = mockStore({
        omnifilters: [
          {
            appliesTo: "CHART",
            chartId: "7",
            name: "-LrFK-ldPB5KvjwK5qIc"
          },
          {
            appliesTo: "CHART",
            chartId: "1",
            name: "-LrFK-ldPB5KvjwK5qId"
          }
        ]
      })

      const expectedAction = {
        type: SAVE_CURRENT_CHART,
        chartId: "7",
        chart: {},
        filtersForChart: [
          {
            appliesTo: "CHART",
            chartId: "7",
            name: "-LrFK-ldPB5KvjwK5qIc"
          }
        ]
      }

      store.dispatch(saveCurrentChart("7", {}))
      expect(store.getActions()[0]).toMatchObject(expectedAction)
    })
  })
})
