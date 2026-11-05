// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Existing promise actions remain until their services migrate. This bridge has
// no Redux-version peer dependency and preserves their pending/result contract.
const isPromise = (value) => value && typeof value.then === "function"
export default function promiseActionMiddleware() {
  return ({ dispatch }) => (next) => (action) => {
    const input = action.payload
    if (!input) {
      return next(action)
    }
    let promise = isPromise(input)
      ? input
      : isPromise(input.promise)
      ? input.promise
      : null
    const data = input.promise ? input.data : undefined
    if (
      !promise &&
      (typeof input === "function" || typeof input.promise === "function")
    ) {
      promise = input.promise ? input.promise() : input()
      if (!isPromise(promise)) {
        return next({ ...action, payload: promise })
      }
    }
    if (!promise) {
      return next(action)
    }
    const meta = action.meta === undefined ? {} : { meta: action.meta }
    next({
      type: `${action.type}_PENDING`,
      ...(data === undefined ? {} : { payload: data }),
      ...meta
    })
    return promise.then(
      (value = null) => {
        const result = {
          type: `${action.type}_FULFILLED`,
          ...(value === null ? {} : { payload: value }),
          ...meta
        }
        dispatch(result)
        return { value, action: result }
      },
      (error) => {
        dispatch({
          type: `${action.type}_REJECTED`,
          ...(error === null || error === undefined ? {} : { payload: error }),
          ...meta,
          error: true
        })
        return Promise.reject(error)
      }
    )
  }
}
