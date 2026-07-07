// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { enqueue, clearQueues, QUEUE_RESOLUTION } from "./MagicQueue"
import { sleep } from "./sleep"

/*
  options
    √ key - the key to this queue
    √throttle - ms, run this function at most every x ms
    √delay - when the throttle is clear, how many ms to wait until running
    √delayOnce - should it be delayed only on initial run, or on all subsequent runs
    √ lastOnly - if true, only the last pending call executes. If false, they all do in sequence
    resolution - nothing, shared, reject, unqueued
*/

const mirrorFunc = jest.fn(
  (a) =>
    // eslint-disable-next-line
    new Promise(async (resolve, reject) => {
      resolve(a)
    })
)

describe("MagicQueue test suite ", () => {
  beforeEach(() => {
    clearQueues()
  })
  it("creates a queued function", async () => {
    const queuedFunc = enqueue(mirrorFunc)
    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    const resA = await promiseA
    const resB = await promiseB
    const resC = await promiseC

    expect(resA).toEqual("A")
    expect(resB).toEqual("C")
    expect(resC).toEqual("C")
  })
  it("creates a queued function, keeping all invocations w/lastOnly", async () => {
    const queuedFunc = enqueue(mirrorFunc, { lastOnly: false })
    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    const resA = await promiseA
    const resB = await promiseB
    const resC = await promiseC

    expect(resA).toEqual("A")
    expect(resB).toEqual("B")
    expect(resC).toEqual("C")
  })
  it("creates a shared, queued function", async () => {
    const unsharedQueuedFunc = enqueue(mirrorFunc)
    await sleep(10) // pause to ensure they're not enqueued in the same ms
    const unsharedQueuedFunc2 = enqueue(mirrorFunc)
    expect(unsharedQueuedFunc).not.toEqual(unsharedQueuedFunc2)

    const queuedFunc = enqueue(mirrorFunc, { key: "mirror-queue" })
    const queuedFunc2 = enqueue(mirrorFunc, { key: "mirror-queue" })
    expect(queuedFunc).toEqual(queuedFunc2)
  })
  it("throttles queued functions appropriately", async () => {
    const unthrottledQueuedFunc = enqueue(mirrorFunc, { throttle: 0 })
    const promiseA = unthrottledQueuedFunc("a")
    const promiseB = unthrottledQueuedFunc("b")

    await promiseA
    const unthrottledMiddle = Date.now()
    await promiseB
    const unthrottledEnd = Date.now()
    expect(unthrottledEnd - unthrottledMiddle).toBeLessThan(10)

    const throttledQueuedFunc = enqueue(mirrorFunc, { throttle: 100 })
    const throttledPromiseA = throttledQueuedFunc("a")
    const throttledPromiseB = throttledQueuedFunc("b")

    await throttledPromiseA
    const throttledMiddle = Date.now()
    await throttledPromiseB
    const throttledEnd = Date.now()
    expect(throttledEnd - throttledMiddle).toBeGreaterThan(95)
  })
  it("delays queued functions appropriately w/0 delay", async () => {
    const undelayedQueuedFunc = enqueue(mirrorFunc, { delay: 0 })
    const start = Date.now()
    await undelayedQueuedFunc("A")
    const end = Date.now()
    expect(end - start).toBeLessThan(10)
  })
  it("delays queued functions appropriately w/100 delay and delayOnce", async () => {
    const delayedQueuedFunc = enqueue(mirrorFunc, {
      delay: 100,
      delayOnce: true
    })
    const start = Date.now()
    await delayedQueuedFunc("A")
    const end = Date.now()
    expect(end - start).toBeGreaterThan(95)
    const start2 = Date.now()
    await delayedQueuedFunc("A")
    const end2 = Date.now()
    expect(end2 - start2).toBeLessThan(10)
  })
  it("delays queued functions appropriately w/100 delay and not delayOnce", async () => {
    const delayedQueuedFunc = enqueue(mirrorFunc, {
      delay: 100,
      delayOnce: false
    })
    const start = Date.now()
    await delayedQueuedFunc("A")
    const end = Date.now()
    expect(end - start).toBeGreaterThan(95)
    const start2 = Date.now()
    await delayedQueuedFunc("A")
    const end2 = Date.now()
    expect(end2 - start2).toBeGreaterThan(95)
  })
  it("uses SHARED resolution", async () => {
    const queuedFunc = enqueue(mirrorFunc, {
      resolution: QUEUE_RESOLUTION.SHARED
    })

    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    expect(promiseA).not.toEqual(promiseB)
    expect(promiseB).toEqual(promiseC)
  })
  it("uses NOTHING resolution", async () => {
    const queuedFunc = enqueue(mirrorFunc, {
      resolution: QUEUE_RESOLUTION.NOTHING
    })

    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    expect(promiseA).not.toEqual(promiseB)
    expect(promiseB).not.toEqual(promiseC)

    const resA = await promiseA
    const resC = await promiseC

    expect(resA).toEqual("A")
    expect(resC).toEqual("C")

    // eslint-disable-next-line
    const escapePromise = new Promise(async (resolve, reject) => {
      await sleep(100)
      resolve("escape!")
    })
    await Promise.race([promiseB, escapePromise]).then((res) => {
      // promiseB would resolve immediately...if we weren't using NOTHING.
      // so we'd expect that the escape promise resolves first
      expect(res).toEqual("escape!")
    })
  })
  it("uses REJECT resolution", async () => {
    const queuedFunc = enqueue(mirrorFunc, {
      resolution: QUEUE_RESOLUTION.REJECT
    })

    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    expect(promiseA).not.toEqual(promiseB)
    expect(promiseB).not.toEqual(promiseC)

    try {
      const resA = await promiseA
      expect(resA).toEqual("A")
    } catch (e) {
      expect(e).not.toBeDefined()
    }
    try {
      const resB = await promiseB
      expect(resB).toEqual("B")
    } catch (e) {
      expect(e).toBeDefined()
    }
    try {
      const resC = await promiseC
      expect(resC).toEqual("C")
    } catch (e) {
      expect(e).not.toBeDefined()
    }
  })
  it("uses UNQUEUED resolution", async () => {
    const queuedFunc = enqueue(mirrorFunc, {
      resolution: QUEUE_RESOLUTION.UNQUEUED
    })

    const promiseA = queuedFunc("A")
    const promiseB = queuedFunc("B")
    const promiseC = queuedFunc("C")

    expect(promiseA).not.toEqual(promiseB)
    expect(promiseB).not.toEqual(promiseC)

    const resA = await promiseA
    expect(resA).toEqual("A")
    const resB = await promiseB
    expect(resB).toEqual("B")
    const resC = await promiseC
    expect(resC).toEqual("C")
  })
})
