// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

let mapboxglModule = { Evented: () => {}, baseApiUrl: "https://api.mapbox.com" }

if (process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line global-require
  mapboxglModule = require("mapbox-gl")
  try {
    mapboxglModule.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.0/mapbox-gl-rtl-text.js"
    )
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      "Could not load mapbox RTL plugin, right to left text will not appear as expected"
    )
  }
  window.mapboxgl = mapboxglModule
}
export default mapboxglModule
