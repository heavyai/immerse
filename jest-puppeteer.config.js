// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const debugMode = process.env.DEBUG === "true"
const slowMode = process.env.SLOW === "true"

module.exports = {
  launch: {
    defaultViewport: {
      width: 1440,
      height: 960
    },
    headless: !debugMode,
    devtools: debugMode,
    slowMo: slowMode ? 50 : 1,
    exitOnPageError: false,
    args: [
      "--start-maximized",
      "--flag-switches-begin",
      "--disable-features=CookiesWithoutSameSiteMustBeSecure,SameSiteByDefaultCookies",
      "--flag-switches-end",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }
}
