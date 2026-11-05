// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext } from "react"
export const HeavyServicesContext = createContext(null)
export default function HeavyServicesProvider({ services, children }) {
  return (
    <HeavyServicesContext.Provider value={services}>
      {children}
    </HeavyServicesContext.Provider>
  )
}
