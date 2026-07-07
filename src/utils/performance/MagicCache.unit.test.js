// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { makeCached, purgeSharedCache } from "./MagicCache"

describe("MagicCache test suite ", () => {
  beforeEach(() => {
    purgeSharedCache()
  })
  it("creates a cached function", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const cachedFunc = makeCached(func)

    expect(cachedFunc("a")).toEqual("A")
    expect(cachedFunc("a")).toEqual("A")
    expect(func.mock.calls.length).toBe(1)
    expect(cachedFunc("B")).toEqual("B")
    expect(cachedFunc("B")).toEqual("B")
    expect(cachedFunc("B")).toEqual("B")
    expect(cachedFunc("B")).toEqual("B")
    expect(cachedFunc("B")).toEqual("B")
    expect(cachedFunc("B")).toEqual("B")
    expect(func.mock.calls.length).toBe(2)
  })

  it("evicts cache when too large", async () => {
    const func = (a) => a.toUpperCase()
    const sharedCache = new Map()
    const cachedFunc = makeCached(func, { maxCacheSize: 5, cache: sharedCache })
    cachedFunc("a")
    cachedFunc("b")
    cachedFunc("c")
    cachedFunc("d")
    cachedFunc("e")
    expect(sharedCache.size).toBe(5)
    cachedFunc("f")
    expect(sharedCache.size).toBe(5)
    cachedFunc("g")
    expect(sharedCache.size).toBe(5)
    cachedFunc("h")
    expect(sharedCache.size).toBe(5)
    cachedFunc("i")
    expect(sharedCache.size).toBe(5)
    cachedFunc("j")
    expect(sharedCache.size).toBe(5)
    cachedFunc("j")
    expect(sharedCache.size).toBe(5)
    cachedFunc("k")
    expect(sharedCache.size).toBe(5)
    cachedFunc("l")
    expect(sharedCache.size).toBe(5)
    cachedFunc("m")
    expect(sharedCache.size).toBe(5)
  })

  it("uses a custom cache validator", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const cachedFunc = makeCached(func, {
      validCachedValue: ({ key }) => key !== `["b"]`
    })
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(2)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(3)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(4)
  })
  it("uses a custom cache memoizer", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const cachedFunc = makeCached(func, {
      validCachedValue: ({ key }) => key !== "b",
      memoizer: (...args) => args[0]
    })
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(2)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(3)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(4)
  })
  it("uses a custom shouldCache", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const cachedFunc = makeCached(func, {
      shouldCache: (key) => key !== "b"
    })
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(2)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(3)
    cachedFunc("b")
    expect(func.mock.calls.length).toBe(4)
  })
  it("returns a non-memoized function", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const sharedCache = new Map()
    const cachedFunc = makeCached(func, {
      memoized: false,
      cache: sharedCache
    })
    cachedFunc("AAA")("a")
    cachedFunc("BBB")("b")

    expect(sharedCache.get("AAA").val).toEqual("A")
    expect(sharedCache.get("BBB").val).toEqual("B")
  })
  it("uses a shared cache", async () => {
    const func = jest.fn((a) => a.toUpperCase())
    const unsharedCachedFunc = makeCached(func)
    const unsharedCachedFunc2 = makeCached(func)

    expect(unsharedCachedFunc).not.toEqual(unsharedCachedFunc2)

    const sharedCachedFunc = makeCached(func, { shared: true })
    const sharedCachedFunc2 = makeCached(func, { shared: true })

    expect(sharedCachedFunc).toEqual(sharedCachedFunc2)
  })
  it("uses a custom keyAge", () => {
    jest.useFakeTimers()
    const func = jest.fn((a) => a.toUpperCase())

    const cachedFunc = makeCached(func, { keyAge: 100 })
    cachedFunc("a")
    cachedFunc("a")
    cachedFunc("a")
    expect(func.mock.calls.length).toBe(1)

    jest.advanceTimersByTime(50)
    cachedFunc("a")
    expect(func.mock.calls.length).toBe(1)

    jest.advanceTimersByTime(51)
    cachedFunc("a")
    expect(func.mock.calls.length).toBe(2)

    jest.useRealTimers()
  })
})
