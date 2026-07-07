// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import isIFramed from "utils/isIFramed"

import { getImmerseUIAction } from "./ImmerseUIProvider"
import { defaultImmerseUIKeys } from "./constants"

// setDefaultImmerseUIKeys will adjust the UI based upon three different things - newKeys
// which are set in immerse_ui_keys in servers.json
// OR query params passed in.
// AND it will also look to server.json's immerse_ui_embed value. That can be
//  the string : "ALL" (case inensitive)
//  the string : "NONE"  (case inensitive)
//  an object with ui_on/ui_off keys that follow the same rules as the query string.
export const setDefaultImmerseUIKeys = (
  defaultKeys,
  defaultEmbedKeys,
  setImmerseUIKey = getImmerseUIAction("setImmerseUIKey")
) => {
  const searchParams = new URLSearchParams(window?.location?.search)

  const allOnKeys = searchParams.has("ui_all_on") ? getAllOnKeys() : {}
  const allOffKeys = searchParams.has("ui_all_off") ? getAllOffKeys() : {}

  const onKeys = extractUIConfigFromQueryString(
    searchParams.get("ui_on") || "",
    true
  )

  const offKeys = extractUIConfigFromQueryString(
    searchParams.get("ui_off") || "",
    false
  )

  let embedKeys = {}
  if (isIFramed()) {
    embedKeys = buildDefaultUIKeys(defaultEmbedKeys)
  }

  const allNewKeys = {
    ...buildDefaultUIKeys(defaultKeys),
    ...embedKeys,
    ...allOnKeys,
    ...allOffKeys,
    ...onKeys,
    ...offKeys
  }
  Object.entries(allNewKeys).forEach(([key, value]) =>
    setImmerseUIKey(key, value)
  )
}

// given a comma delimited list of key candidates, return an object mapping valid candidate -> value
export function extractUIConfigFromQueryString(keyString = "", value) {
  return buildUIKeyMapping(keyString.split(/,/), value)
}

// given a an array of key candidates, return an object mapping valid candiate -> value
export function buildUIKeyMapping(keys = [], value) {
  return (
    keys
      // we don't want to require the IMMERSE_UI_ prefix, but we also don't want to preven it.
      // strip any out so we can re-add them.
      .map((k) => k.replace(/(IMMERSE_UI_)+/i, ""))
      // make sure the key is a string, upper case it, and prepend with IMMERSE_UI_
      .map((k) => `IMMERSE_UI_${String(k).toUpperCase()}`)
      // only continue if we know this is a valid UI key
      .filter((k) => k in defaultImmerseUIKeys)
      // and finally reduce into an object mapping the key to whatever value we requested.
      .reduce((bucket, k) => ({ ...bucket, [k]: value }), {})
  )
}

export function buildDefaultUIKeys(defaultKeys) {
  let parsedKeys = {}
  if (isAllString(defaultKeys)) {
    parsedKeys = getAllOnKeys()
  } else if (isNoneString(defaultKeys)) {
    parsedKeys = getAllOffKeys()
  } else if (typeof defaultKeys === "object") {
    // if we have specified a default value, then start with that.
    // if it's ALL, turn 'em all on, otherwise assume all off.
    if (defaultKeys.default) {
      parsedKeys = {
        ...buildUIKeyMapping(
          Object.keys(defaultImmerseUIKeys),
          isAllString(defaultKeys.default)
        )
      }
    }
    parsedKeys = {
      ...parsedKeys,
      ...buildUIKeyMapping(defaultKeys.ui_on, true),
      ...buildUIKeyMapping(defaultKeys.ui_off, false)
    }
  }
  return parsedKeys
}

export function getAllOnKeys() {
  return buildUIKeyMapping(Object.keys(defaultImmerseUIKeys), true)
}

export function getAllOffKeys() {
  return buildUIKeyMapping(Object.keys(defaultImmerseUIKeys), false)
}

export function isAllString(string) {
  return String(string).toUpperCase() === "ALL"
}

export function isNoneString(string) {
  return String(string).toUpperCase() === "NONE"
}
