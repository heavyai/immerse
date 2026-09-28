// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getGoogleApiKey, getMapboxToken } from "./map-service-keys"

describe("map service keys", () => {
  const original = window.APP_CONFIG

  afterEach(() => {
    window.APP_CONFIG = original
  })

  it("reads mapboxToken and googleApiKey from servers.json", () => {
    window.APP_CONFIG = [
      {
        mapboxToken: "pk.servers",
        googleApiKey: "AIza-servers"
      }
    ]

    expect(getMapboxToken()).toBe("pk.servers")
    expect(getGoogleApiKey()).toBe("AIza-servers")
  })

  it("accepts the environment-variable names on the servers.json entry", () => {
    window.APP_CONFIG = [
      {
        MAPBOX_TOKEN: "pk.env-name",
        GOOGLE_API_KEY: "AIza-env-name"
      }
    ]

    expect(getMapboxToken()).toBe("pk.env-name")
    expect(getGoogleApiKey()).toBe("AIza-env-name")
  })

  it("ignores blank servers.json values and uses the compiled token", () => {
    window.APP_CONFIG = [{ mapboxToken: "  ", googleApiKey: "" }]

    expect(getMapboxToken()).toBe(process.env.MAPBOX_TOKEN)
    expect(getGoogleApiKey()).toBe(process.env.GOOGLE_API_KEY)
  })
})
