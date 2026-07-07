// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext } from "react"

export const ImmerseUIContext = createContext({
  immerseUIKeys: new Proxy({}, { get: () => true }),
  immerseUIKeyActions: {}
})

export const useImmerseUIContext = () => useContext(ImmerseUIContext)

export const REMOVE_BY_DELETE = "REMOVE_BY_DELETE"
export const REMOVE_BY_NO_DISPLAY = "REMOVE_BY_NO_DISPLAY"
export const REMOVE_BY_NO_OPACITY = "REMOVE_BY_NO_OPACITY"

export const ImmerseUIRequired = ({
  uiKey,
  children,
  type = REMOVE_BY_DELETE
}) => {
  const value = useImmerseUIContext().immerseUIKeys[uiKey]
  if (!value) {
    switch (type) {
      case REMOVE_BY_DELETE:
        return null
      case REMOVE_BY_NO_DISPLAY:
        return <div style={{ display: "none" }}>{children}</div>
      case REMOVE_BY_NO_OPACITY:
        return <div style={{ opacity: 0 }}>{children}</div>
      default:
        throw new Error(
          `Cannot determine if UI required: unknown type '${type}'`
        )
    }
  }

  return children
}
