// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Determine the global object without relying on globalThis to satisfy older linters
// eslint-disable-next-line no-undef
const g =
  typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : {}

// Minimal structuredClone fallback for environments lacking it
if (!("structuredClone" in g)) {
  Object.defineProperty(g, "structuredClone", {
    /**
     * @param {any} value
     */
    value: function structuredCloneFallback(value) {
      try {
        return JSON.parse(JSON.stringify(value))
      } catch (_e) {
        return value
      }
    },
    writable: true,
    configurable: true
  })
}

// Polyfill for ES2022 Object.hasOwn used by Vega utils in older Chromium
if (!("hasOwn" in Object)) {
  Object.defineProperty(Object, "hasOwn", {
    /**
     * @param {any} object
     * @param {PropertyKey} property
     */
    value: function hasOwn(object, property) {
      return Object.prototype.hasOwnProperty.call(object, property)
    },
    writable: true,
    configurable: true
  })
}

// Polyfill for String.prototype.replaceAll used by some Vega code paths
if (typeof String.prototype.replaceAll !== "function") {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, "replaceAll", {
    /**
     * @param {string|RegExp} search
     * @param {string} replacement
     */
    value: function replaceAll(search, replacement) {
      const target = String(this)
      if (search instanceof RegExp) {
        if (!search.global) {
          throw new TypeError("replaceAll with RegExp requires global flag")
        }
        return target.replace(search, replacement)
      }
      return target.split(String(search)).join(String(replacement))
    },
    writable: true,
    configurable: true
  })
}
