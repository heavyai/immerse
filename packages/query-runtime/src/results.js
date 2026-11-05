// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class StaleQueryError extends Error {
  constructor() {
    super("Query result belongs to an obsolete request")
    this.name = "AbortError"
  }
}

function createChartQueryRuntime() {
  let snapshot = Object.create(null)
  let renderSnapshot = Object.create(null)
  let epoch = 0
  let sequence = 0
  let disposed = false
  const generations = new Map()
  const listeners = new Set()
  const controllers = new Map()
  const sharedTickets = new WeakMap()
  const invalidationListeners = new Set()
  const notify = () => listeners.forEach((listener) => listener())
  const keyFor = ({ chartId, dashboardId, sourceId, channel = "query" }) =>
    JSON.stringify([String(chartId), dashboardId, sourceId, channel])
  function begin(identity) {
    if (disposed) {
      throw new Error("Query runtime has been disposed")
    }
    const key = keyFor(identity)
    const ticket = { ...identity, key, epoch, generation: ++sequence }
    generations.set(key, ticket)
    return ticket
  }
  function track(identity, promise) {
    const key = keyFor(identity)
    const tickets = sharedTickets.get(promise) || new Map()
    const existing = tickets.get(key)
    if (existing && isCurrent(existing)) {
      return existing
    }
    const ticket = begin(identity)
    tickets.set(key, ticket)
    sharedTickets.set(promise, tickets)
    return ticket
  }
  function guard(ticket, promise) {
    return promise.then(
      (value) => {
        if (!isCurrent(ticket)) {
          throw new StaleQueryError()
        }
        return value
      },
      (error) => {
        if (!isCurrent(ticket)) {
          throw new StaleQueryError()
        }
        throw error
      }
    )
  }
  function isCurrent(ticket) {
    return (
      !disposed &&
      ticket.epoch === epoch &&
      generations.get(ticket.key) === ticket
    )
  }
  function write(chartId, token, data) {
    if (disposed) {
      return false
    }
    const id = String(chartId)
    if (snapshot[id]?.[token] === data) {
      return false
    }
    snapshot = { ...snapshot, [id]: { ...snapshot[id], [token]: data } }
    notify()
    return true
  }
  function writeRender(chartId, data) {
    if (disposed || renderSnapshot[String(chartId)] === data) {
      return false
    }
    renderSnapshot = { ...renderSnapshot, [String(chartId)]: data }
    notify()
    return true
  }
  function commit(ticket, token, data) {
    return isCurrent(ticket) && write(ticket.chartId, token, data)
  }
  function invalidate({ chartId } = {}) {
    invalidationListeners.forEach((listener) => listener({ chartId }))
    if (chartId === undefined) {
      epoch += 1
      generations.clear()
      controllers.forEach((controller) => controller.abort())
      controllers.clear()
      snapshot = Object.create(null)
      renderSnapshot = Object.create(null)
    } else {
      const id = String(chartId)
      generations.forEach((ticket, key) => {
        if (String(ticket.chartId) === id) {
          generations.delete(key)
          controllers.get(key)?.abort()
          controllers.delete(key)
        }
      })
      const { [id]: removed, ...remaining } = snapshot
      snapshot = remaining
      const { [id]: removedRender, ...remainingRender } = renderSnapshot
      renderSnapshot = remainingRender
    }
    notify()
  }
  async function execute(identity, run, { signal } = {}) {
    const ticket = begin(identity)
    const controller = new AbortController()
    controllers.get(ticket.key)?.abort()
    controllers.set(ticket.key, controller)
    const abort = () => controller.abort()
    signal?.addEventListener("abort", abort, { once: true })
    if (signal?.aborted) {
      controller.abort()
    }
    try {
      const value = await run(controller.signal)
      if (controller.signal.aborted || !isCurrent(ticket)) {
        throw new StaleQueryError()
      }
      return value
    } finally {
      signal?.removeEventListener("abort", abort)
      if (controllers.get(ticket.key) === controller) {
        controllers.delete(ticket.key)
      }
    }
  }
  return {
    begin,
    track,
    guard,
    isCurrent,
    commit,
    write,
    invalidate,
    execute,
    onInvalidate: (listener) => {
      invalidationListeners.add(listener)
      return () => invalidationListeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    getRenderSnapshot: () => renderSnapshot,
    readRender: (chartId) => renderSnapshot[String(chartId)],
    writeRender,
    read: (chartId, token) => snapshot[String(chartId)]?.[token],
    readChart: (chartId) => snapshot[String(chartId)],
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    dispose: () => {
      invalidate()
      disposed = true
      listeners.clear()
      invalidationListeners.clear()
    }
  }
}
module.exports = { createChartQueryRuntime, StaleQueryError }
