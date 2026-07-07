// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeAppConfig } from "./app-config"

describe("normalize app config", () => {
  it("adds protocol, host, and port props to object passed in with url prop", () => {
    const url = "http://my.host.com:8000"
    const serversJson = { url }

    expect(normalizeAppConfig(serversJson)).toEqual({
      url,
      protocol: "http",
      host: "my.host.com",
      port: 8000
    })
  })

  it("excludes trailing slashes on url", () => {
    const url = "http://my.host.com:8000/"
    const serversJson = { url }

    const expectedUrl = "http://my.host.com:8000"

    expect(normalizeAppConfig(serversJson)).toEqual({
      url: expectedUrl,
      protocol: "http",
      host: "my.host.com",
      port: 8000
    })
  })

  it("default port set if absent", () => {
    const url = "http://my.host.com"
    const serversJson = { url }

    expect(normalizeAppConfig(serversJson)).toEqual({
      url: "http://my.host.com:80",
      protocol: "http",
      host: "my.host.com",
      port: 80
    })

    serversJson.url = "https://my.securehost.com/"

    expect(normalizeAppConfig(serversJson)).toEqual({
      url: "https://my.securehost.com:443",
      protocol: "https",
      host: "my.securehost.com",
      port: 443
    })
  })
})
