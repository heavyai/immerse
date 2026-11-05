// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { createChartQueryRuntime } = require("./index")
const deferred = () => {
  let resolve = null
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
it("keeps result snapshots outside Redux and isolates application instances", () => {
  const a = createChartQueryRuntime()
  const b = createChartQueryRuntime()
  const changed = jest.fn()
  const unsubscribe = a.subscribe(changed)
  const before = a.getSnapshot()
  a.write("1", "rows", [1])
  expect(a.read("1", "rows")).toEqual([1])
  expect(before["1"]).toBeUndefined()
  expect(b.read("1", "rows")).toBeUndefined()
  unsubscribe()
  a.write("1", "rows", [2])
  expect(changed).toHaveBeenCalledTimes(1)
})
it("rejects late results while keeping coalesced pending callers together", async () => {
  const runtime = createChartQueryRuntime()
  const first = deferred()
  const pending = deferred()
  const identity = { chartId: "1", dashboardId: "a", channel: "data" }
  const stale = runtime.guard(
    runtime.track(identity, first.promise),
    first.promise
  )
  const rejected = expect(stale).rejects.toMatchObject({ name: "AbortError" })
  const b = runtime.track(identity, pending.promise)
  expect(runtime.track(identity, pending.promise)).toBe(b)
  first.resolve("old")
  await rejected
  pending.resolve("latest")
  expect(await runtime.guard(b, pending.promise)).toBe("latest")
  expect(runtime.commit(b, "rows", "latest")).toBe(true)
})
it.each(["dashboard switch", "reset", "logout"])(
  "invalidates in-flight data on %s",
  () => {
    const runtime = createChartQueryRuntime()
    const ticket = runtime.begin({ chartId: "1" })
    runtime.write("1", "rows", [1])
    runtime.invalidate()
    expect(runtime.commit(ticket, "rows", [2])).toBe(false)
    expect(runtime.read("1", "rows")).toBeUndefined()
  }
)
it("deleting a chart preserves unrelated results and prevents its late commit", () => {
  const runtime = createChartQueryRuntime()
  const a = runtime.begin({ chartId: "1" })
  const b = runtime.begin({ chartId: "2" })
  runtime.commit(a, "rows", [1])
  runtime.commit(b, "rows", [2])
  runtime.invalidate({ chartId: "1" })
  expect(runtime.commit(a, "rows", [3])).toBe(false)
  expect(runtime.read("2", "rows")).toEqual([2])
})
it("passes cancellation to capable transports and still rejects non-cooperative late work", async () => {
  const runtime = createChartQueryRuntime()
  const pending = deferred()
  let signal = null
  const request = runtime.execute({ chartId: "1" }, (inputSignal) => {
    signal = inputSignal
    return pending.promise
  })
  const rejected = expect(request).rejects.toMatchObject({ name: "AbortError" })
  runtime.invalidate()
  expect(signal.aborted).toBe(true)
  pending.resolve([1])
  await rejected
  runtime.dispose()
  expect(runtime.write("1", "rows", [2])).toBe(false)
})

it("keeps concurrent datasource count queries in independent channels", () => {
  const runtime = createChartQueryRuntime()
  const a = runtime.begin({
    chartId: "count",
    sourceId: "sales",
    channel: "count"
  })
  const b = runtime.begin({
    chartId: "count",
    sourceId: "orders",
    channel: "count"
  })
  expect(runtime.isCurrent(a)).toBe(true)
  expect(runtime.isCurrent(b)).toBe(true)
})
