// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from "@testing-library/react-hooks"
import { Provider } from "react-redux"
import React from "react"
import { useShouldShowEnterprisePrompt } from "./utils"
import thunk from "redux-thunk"
import configureStore from "redux-mock-store"

const mockState = {
  dashboard: {
    dataSources: {},
    loadState: {}
  },
  connection: {
    isMSDEnabled: false
  },
  dc: {
    render: {
      error: false
    },
    redraw: {
      error: false
    }
  },
  chartEditor: {
    savedDataSources: { dataSources: { tweets: true } },
    savedCharts: {
      1: {}
    },
    savedFilters: {
      1: []
    }
  },
  charts: {
    1: {},
    2: {},
    3: {}
  },
  ui: {
    selectorPillHover: { shouldShowPrompt: false, top: false }
  },
  tables: { list: [] }
}

describe("useShouldShowEnterprisePrompt test suite", () => {
  /* eslint-disable react/display-name */
  const middlewares = [thunk]
  const mockStore = configureStore(middlewares)
  it("can useShouldShowEnterprisePrompt when multisource is disabled", () => {
    const store = mockStore(mockState)
    const { result } = renderHook(() => useShouldShowEnterprisePrompt(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const res = result.current("flights")

    expect(res).toEqual(true)
  })

  it("can useShouldShowEnterprisePrompt when multisource is enabled", () => {
    const store = mockStore({
      ...mockState,
      connection: {
        isMSDEnabled: true
      }
    })
    const { result } = renderHook(() => useShouldShowEnterprisePrompt(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const res = result.current("flights")

    expect(res).toEqual(false)
  })
})
