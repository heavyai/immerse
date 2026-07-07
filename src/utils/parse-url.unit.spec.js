// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import parseUrl from "./parse-url"

describe("parse url", () => {
  const locationStub = {}

  it("adds protocol, host, and port props to object passed in with url prop", () => {
    const url = "http://my.host.com:8000"
    expect(parseUrl(locationStub)({ url })).eql({
      url,
      protocol: "http",
      host: "my.host.com",
      port: 8000
    })
  })

  it("works for different hosts", () => {
    const url1 = "http://a.host.com:8000"
    const url2 = "b.host.com"
    expect(parseUrl(locationStub)({ url: url1 })).to.eql({
      url: url1,
      protocol: "http",
      host: "a.host.com",
      port: 8000
    })
    expect(parseUrl({ protocol: "https:" })({ url: url2 })).to.eql({
      url: url2,
      protocol: "https",
      host: "b.host.com",
      port: 443
    })
  })

  it("works for different protocols", () => {
    const url1 = "http://my.host.com:8000"
    const url2 = "https://my.host.com:9999"
    const url3 = "file:///myFile/lives/here.json"
    expect(parseUrl(locationStub)({ url: url1 })).to.eql({
      url: url1,
      protocol: "http",
      host: "my.host.com",
      port: 8000
    })
    expect(parseUrl(locationStub)({ url: url2 })).to.eql({
      url: url2,
      protocol: "https",
      host: "my.host.com",
      port: 9999
    })
    expect(parseUrl(locationStub)({ url: url3 })).to.eql({
      url: url3,
      protocol: "file",
      host: "/myFile/lives/here.json",
      port: undefined
    })
  })

  it("defaults to window's location for missing values", () => {
    const actualLocationStub = {
      protocol: "prot",
      hostname: "le.host.me",
      port: 1234
    }
    expect(parseUrl(actualLocationStub)({})).to.eql({
      protocol: "prot",
      host: "le.host.me",
      port: 1234
    })
  })

  it("chooses port based on http protocol if not specified", () => {
    const url1 = "http://a.host.com"
    const url2 = "https://b.host.com"
    const url3 = "prot://c.host.com"
    expect(parseUrl(locationStub)({ url: url1 })).to.eql({
      url: url1,
      protocol: "http",
      host: "a.host.com",
      port: 80
    })
    expect(parseUrl(locationStub)({ url: url2 })).to.eql({
      url: url2,
      protocol: "https",
      host: "b.host.com",
      port: 443
    })
    expect(parseUrl(locationStub)({ url: url3 })).to.eql({
      url: url3,
      protocol: "prot",
      host: "c.host.com",
      port: undefined
    })
  })
})
