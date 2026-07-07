// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useReducer } from "react"
import { ImmerseUIContext } from "./ImmerseUIContext"
import { defaultImmerseUIKeys } from "./constants"
import {
  setImmerseUIKey as setImmerseUIKeyAction,
  setImmerseUIKeys as setImmerseUIKeysAction,
  enableAllImmerseUIKeys as enableAllImmerseUIKeysAction,
  disableAllImmerseUIKeys as disableAllImmerseUIKeysAction
} from "./actions"
import reducer from "./reducer"
import GarbageUI from "./GarbageUI"

const immerseUIKeyActions = {}

export const getImmerseUIAction = (action) => immerseUIKeyActions[action]

const ImmerseUIProvider = ({ children }) => {
  const [immerseUIKeys, dispatch] = useReducer(reducer, defaultImmerseUIKeys)

  immerseUIKeyActions.setImmerseUIKey = (key, value) =>
    dispatch(setImmerseUIKeyAction(key, value))
  immerseUIKeyActions.setImmerseUIKeys = (config) =>
    dispatch(setImmerseUIKeysAction(config))
  immerseUIKeyActions.toggleImmerseUIKey = (key) =>
    dispatch(setImmerseUIKeyAction(key, !immerseUIKeys[key]))
  immerseUIKeyActions.enableAllImmerseUIKeys = () =>
    dispatch(enableAllImmerseUIKeysAction())
  immerseUIKeyActions.disableAllImmerseUIKeys = () =>
    dispatch(disableAllImmerseUIKeysAction())
  immerseUIKeyActions.getImmerseUIKeys = () => immerseUIKeys

  return (
    <ImmerseUIContext.Provider
      value={{
        immerseUIKeys,
        immerseUIKeyActions
      }}
    >
      <GarbageUI />
      {children}
    </ImmerseUIContext.Provider>
  )
}

// the ImmerseUIProvider -only- pays attention to children, and we get a new list every time because of Reasons.
// so we just ignore it entirely and never re-render, only triggering when our context changes.
export default React.memo(ImmerseUIProvider, () => true)
