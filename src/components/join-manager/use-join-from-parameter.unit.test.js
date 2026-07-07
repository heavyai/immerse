// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { renderHookWithStore } from "jest/renderScaffolding"
import { useJoinFromParameter } from "./use-join-from-parameter"

describe("useJoinFromParameter", () => {
  const paramId = "APARAM"
  const mockJoinDataSource = {
    name: "It's a Join",
    id: "-NOM7RQxA5XlwNiXx20C",
    joins: [],
    parameter: paramId
  }
  const initialState = {
    joinDataSources: [mockJoinDataSource]
  }

  it("should return join associated with parameter", () => {
    const { result } = renderHookWithStore(
      () => useJoinFromParameter(paramId),
      {
        initialState
      }
    )
    expect(result.current.id).toEqual(mockJoinDataSource.id)
  })

  it("should return undefined if param id not found", () => {
    const { result } = renderHookWithStore(
      () => useJoinFromParameter("NOTFOUND"),
      {
        initialState
      }
    )
    expect(result.current).toBeUndefined()
  })
})
