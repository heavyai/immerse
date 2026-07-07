// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultImmerseUIKeys } from "./constants"

import {
  setDefaultImmerseUIKeys,
  extractUIConfigFromQueryString,
  buildUIKeyMapping,
  buildDefaultUIKeys
} from "./set-default-keys"

describe("immerse ui provider set-default-keys test suite", () => {
  it("can setDefaultImmerseUIKeys", () => {
    let ui = {}
    const setImmerseUIKey = function setImmerseUIKey(key, value) {
      ui[key] = value
    }

    setDefaultImmerseUIKeys({ ui_on: ["add_chart"] }, {}, setImmerseUIKey)
    expect(ui).toEqual({ IMMERSE_UI_ADD_CHART: true })

    ui = {}
    setDefaultImmerseUIKeys({ ui_off: ["add_chart"] }, {}, setImmerseUIKey)
    expect(ui).toEqual({ IMMERSE_UI_ADD_CHART: false })

    ui = {}
    const allOnKeys = Object.keys(defaultImmerseUIKeys).reduce(
      (bucket, key) => ({ ...bucket, [key]: true }),
      {}
    )
    setDefaultImmerseUIKeys(
      { default: "ALL", ui_off: ["add_chart"] },
      {},
      setImmerseUIKey
    )
    expect(ui).toEqual({ ...allOnKeys, IMMERSE_UI_ADD_CHART: false })

    ui = {}
    setDefaultImmerseUIKeys(
      { default: "all", ui_off: ["add_chart"] },
      {},
      setImmerseUIKey
    )
    expect(ui).toEqual({ ...allOnKeys, IMMERSE_UI_ADD_CHART: false })
  })
  it("can extractUIConfigFromQueryString", () => {
    expect(extractUIConfigFromQueryString("add_chart,foo", true)).toEqual({
      IMMERSE_UI_ADD_CHART: true
    })
    expect(
      extractUIConfigFromQueryString("navbar,IMMERSE_UI_GLOBAL_SIDE_NAV", false)
    ).toEqual({
      IMMERSE_UI_NAVBAR: false,
      IMMERSE_UI_GLOBAL_SIDE_NAV: false
    })
  })
  it("can buildUIKeyMapping", () => {
    expect(buildUIKeyMapping(["add_chart", "foo"], true)).toEqual({
      IMMERSE_UI_ADD_CHART: true
    })
    expect(
      buildUIKeyMapping(["navbar", "IMMERSE_UI_GLOBAL_SIDE_NAV"], false)
    ).toEqual({
      IMMERSE_UI_NAVBAR: false,
      IMMERSE_UI_GLOBAL_SIDE_NAV: false
    })
  })
  it("can buildDefaultUIKeys", () => {
    const allOnKeys = Object.keys(defaultImmerseUIKeys).reduce(
      (bucket, key) => ({ ...bucket, [key]: true }),
      {}
    )
    const allOffKeys = Object.keys(defaultImmerseUIKeys).reduce(
      (bucket, key) => ({ ...bucket, [key]: false }),
      {}
    )
    expect(buildDefaultUIKeys("ALL")).toEqual(allOnKeys)
    expect(buildDefaultUIKeys("all")).toEqual(allOnKeys)
    expect(buildDefaultUIKeys("NONE")).toEqual(allOffKeys)
    expect(buildDefaultUIKeys("none")).toEqual(allOffKeys)
    expect(buildDefaultUIKeys({ default: "ALL" })).toEqual(allOnKeys)
    expect(buildDefaultUIKeys({ default: "all" })).toEqual(allOnKeys)
    expect(buildDefaultUIKeys({ default: "NONE" })).toEqual(allOffKeys)
    expect(buildDefaultUIKeys({ default: "none" })).toEqual(allOffKeys)
    expect(
      buildDefaultUIKeys({ default: "ALL", ui_off: ["add_chart"] })
    ).toEqual({ ...allOnKeys, IMMERSE_UI_ADD_CHART: false })
    expect(
      buildDefaultUIKeys({ default: "all", ui_off: ["add_chart"] })
    ).toEqual({ ...allOnKeys, IMMERSE_UI_ADD_CHART: false })
    expect(
      buildDefaultUIKeys({ default: "NONE", ui_on: ["add_chart"] })
    ).toEqual({ ...allOffKeys, IMMERSE_UI_ADD_CHART: true })
    expect(
      buildDefaultUIKeys({ default: "none", ui_on: ["add_chart"] })
    ).toEqual({ ...allOffKeys, IMMERSE_UI_ADD_CHART: true })
  })
})
