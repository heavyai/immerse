// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import mockAppState from "./mock-app-state"
import { noop } from "utils/helpers"
import { Provider } from "react-redux"
import React from "react"

const mockServices = new Map()

export default function withStoreContext(
  wrapper,
  state = mockAppState,
  dispatch = noop,
  services = mockServices
) {
  const store = {
    getState: () => state,
    subscribe: noop,
    dispatch,
    services
  }

  return <Provider store={store}>{wrapper}</Provider>
}
