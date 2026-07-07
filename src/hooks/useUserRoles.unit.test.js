// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useUserRoles } from "./useUserRoles"
import { setUserRoles } from "actions/connection-action-creators"
import { renderHookWithStore } from "../../test-config/jest/renderScaffolding"
import TestRenderer from "react-test-renderer"
const { act } = TestRenderer

describe("useUserRoles()", () => {
  let mockState

  beforeEach(() => {
    mockState = {
      connection: {
        roles: []
      }
    }
  })

  it("should return roles from state", () => {
    const { result } = renderHookWithStore(() => useUserRoles(), {
      initialState: {}
    })
    expect(result.current).toEqual([])
  })

  it("should update with new roles from state", async () => {
    const { result, rerender, store } = renderHookWithStore(
      () => useUserRoles(),
      {
        initialState: mockState
      }
    )
    expect(result.current).toEqual([])

    act(() => {
      store.dispatch(setUserRoles(true, ["fake"]))
    })
    rerender()

    expect(result.current).toEqual(["fake"])
  })
})
