// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import dcReducer from "./dc-reducer"

describe("DC Reducer", () => {
  describe("CHART_RENDER_SUCCESS reducer", () => {
    describe("when all initial charts have been rendered", () => {
      it("should set render done", () => {
        const state = {
          initialRender: {
            done: true,
            pending: true,
            error: false,
            numCharts: 1,
            counter: 1
          },
          render: {
            "1": {
              done: false,
              pending: true,
              error: false
            }
          }
        }
        const nextState = dcReducer(state, {
          type: "CHART_RENDER_SUCCESS",
          id: "1"
        })

        expect(nextState.initialRender).toEqual(state.initialRender)
        expect(nextState.render["1"]).toEqual({
          done: true,
          pending: false,
          error: false
        })
      })
    })
    describe("when all initial charts have not been rendered", () => {
      it("should increment initialRender counter", () => {
        const state = {
          initialRender: {
            done: false,
            pending: true,
            error: false,
            numCharts: 2,
            counter: 0
          },
          "1": {
            done: false,
            pending: true,
            error: false
          }
        }
        const nextState = dcReducer(state, {
          type: "CHART_RENDER_SUCCESS",
          id: "1"
        })
        expect(nextState.initialRender).toEqual({
          done: false,
          pending: true,
          error: false,
          numCharts: 2,
          counter: 1
        })
        expect(nextState.render["1"]).toEqual({
          done: true,
          pending: false,
          error: false
        })
      })
    })
  })

  describe("REDRAW_REQUEST", () => {
    it("should return the correct action type", () => {
      const state = {
        redraw: {
          id: null,
          done: false,
          pending: false,
          error: false
        }
      }
      const { redraw } = dcReducer(state, {
        type: "CHART_REDRAW_REQUEST",
        id: "1"
      })
      expect(redraw).toEqual({
        id: "1",
        done: false,
        pending: true,
        error: false
      })
    })
  })

  describe("REDRAW_SUCCESS", () => {
    it("should return the correct action type", () => {
      const state = {
        redraw: {
          id: "1",
          done: false,
          pending: true,
          error: false
        }
      }
      const { redraw } = dcReducer(state, {
        type: "CHART_REDRAW_SUCCESS",
        id: "1"
      })
      expect(redraw).toEqual({
        id: "1",
        done: true,
        pending: false,
        error: false
      })
    })
  })

  describe("REDRAW_ERROR", () => {
    it("should return the correct action type", () => {
      const state = {
        redraw: {
          id: "1",
          done: false,
          pending: true,
          error: false
        }
      }
      const { redraw } = dcReducer(state, {
        type: "CHART_REDRAW_ERROR",
        id: "1",
        error: "error"
      })
      expect(redraw).toEqual({
        id: "1",
        done: false,
        pending: false,
        error: "error"
      })
    })
  })
})
