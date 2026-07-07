// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  safety wrapper around directly accessing localStorage. Takes a key to lookup and an options object.
  const val = retrieveFromLocalStorage("Some Local Storage Key", { defaultValue : "foo", asJSON : false})
  No options are required. Your choices are:
  * defaultValue - if the key isn't in localStorage, get this value back instead.
  * asJSON - if the key is in localStorage, then parse it as JSON and return that instead.

  It covers a number of cases for us:
  * it handles the times when window doesn't exist or window.localStorage doesn't exist
  * it handles cross-domain/iframe issues where you don't have access to window or window.localStorage
  * It lets you set a default value, for graceful failover.
  * It'll parse JSON for you *and* catch the error in case you have invalid json in there.
  * It doesn't actually fail - if any of these things don't succeed, it logs it out and then
    returns your defaultValue.
*/

export function retrieveFromLocalStorage(
  key,
  { defaultValue, asJSON = false } = {}
) {
  try {
    const val = window.localStorage.getItem(key)

    if (val === undefined || val === null) {
      return defaultValue
    }

    return asJSON ? JSON.parse(val) : val
  } catch (e) {
    // eslint-disable-next-line
    console.log(`Could not retrieve ${key} from localStorage : ${e.message}`)
    return defaultValue
  }
}

// this is the protected setter of the above.
// just call as storeKeyInLocalStorage(key, value)
// will return the value if it's set, or undefined if not. But you probably don't care about the return.
// if you set an undefined, it'll delete the key.

export function storeInLocalStorage(key, value) {
  try {
    if (value === undefined) {
      window.localStorage.removeItem(key)
    } else {
      window.localStorage.setItem(key, value)
    }
    return value
  } catch (e) {
    // eslint-disable-next-line
    console.log(`Could not set key in localStorage : ${e.message}`)
    return undefined
  }
}

// this is just a pretty wrapper so you don't have to call storeInLocalStorage(key, undefined) if you don't want to.
export function deleteFromLocalStorage(key) {
  return storeInLocalStorage(key, undefined)
}
