// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isEnabledFromCookie(k) {
  return Boolean(document.cookie.match(`(^|; )${k}=true`))
}

export function getCookiesAsObj() {
  return document.cookie.split(";").reduce((a, d) => {
    const cookie = d.trim().split("=")
    a[cookie[0]] = cookie[1]
    return a
  }, {})
}

function enableCookie(feature) {
  document.cookie = `${feature}=true`
  return `${feature} was enabled`
}

function disableCookie(feature) {
  document.cookie = `${feature}=false;expires=Thu, 01 Jan 1970 00:00:01 GMT`
  return `${feature} was disabled`
}

function cookieIsEnabled(feature) {
  return (document.cookie.match(`(^|; )${feature}=([^;]*)`) || 0)[2]
}

export const enableCookieHandler = () => {
  if (window) {
    window.enable = enableCookie
    window.disable = disableCookie
    window.isEnabled = cookieIsEnabled
  }
}
