// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import reducer, { initialState } from "reducers/connection"
import * as actions from "actions/connection-action-creators"

describe("connection reducer", () => {
  it("should return initial state", () => {
    expect(reducer(undefined, "")).toEqual(initialState)
  })

  it("should handle CONNECTION_REQUEST type", () => {
    const action = actions.connectionRequest({
      database: "heavyai",
      url: "http://kali.heavyai.com:10043",
      username: "heavyai",
      protocol: "http:",
      version: "v2-23512512",
      offline: false
    })
    expect(reducer(initialState, action)).toEqual(
      Object.assign({}, initialState, {
        loading: true,
        error: false,
        user: {
          database: "heavyai",
          mapboxCustomStyles: [],
          offline: false,
          protocol: "http:",
          url: "http://kali.heavyai.com:10043",
          username: "heavyai",
          version: "v2-23512512"
        }
      })
    )
  })

  it("should handle CONNECTION_ERROR type", () => {
    const error = "ERROR"
    const action = actions.connectionError(error, {})
    expect(reducer(initialState, action)).toEqual(
      Object.assign({}, initialState, {
        loading: false,
        serversJsonPending: false,
        error
      })
    )
  })

  it("should handle CONNECTION_SUCCESS type", () => {
    const statuses = [
      {
        read_only: false,
        rendering_enabled: true,
        poly_rendering_enabled: true,
        version: "v2-23512512"
      }
    ]

    const sessionInfo = {
      user: "USER",
      database: "DATABASE"
    }

    const sessionId = 123456

    const action = actions.connectionSuccess(
      sessionId,
      sessionInfo,
      statuses,
      "test"
    )

    expect(reducer(initialState, action)).toEqual(
      Object.assign({}, initialState, {
        GTM: "test",
        isDevMode: true,
        isConnected: true,
        isRenderingEnabled: true,
        isPolyRasterEnabled: true,
        isPolyRenderingAvailable: true,
        isCluster: false,
        isMSDEnabled: true,
        isMultiLayeringEnabled: true,
        nodeCount: 1,
        sessionId,
        sessionInfo,
        version: "v2-23512512",
        hostId: ""
      })
    )
  })

  it("should handle DROP_CONNECTION type and only remove password", () => {
    const state = {
      isConnected: true,
      user: {
        user: "bob"
      },
      serversJsonPending: false
    }

    const action = { type: "DROP_CONNECTION" }

    expect(reducer(state, action)).toEqual(
      Object.assign({}, initialState, {
        user: {
          user: state.user.user
        },
        serversJsonPending: false
      })
    )
  })
})
