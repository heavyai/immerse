// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  MagicCache is a powerful generic queue implementation with numerous options.

  General pattern is:

  const func = () => { /* do something that returns a promise * / }
  const queuedFunc = enqueue(func, options )

  queuedFunc will now ensure that all calls to func will run serially in order. With tons of options, as detailed below.

  e.g.,

  const func = val => {
    return new Promise( (resolve, reject) => {
      setTimeout( () => resolve(val), 1000 )
    })
  }

  const queuedFunc = enqueue(func)

  // call several times. Note that by default, it'll throw out interim invocations.
  const promiseA = queuedFunc("A")
  const promiseB = queuedFunc("B")
  const promiseC = queuedFunc("C")

  promiseA.then(v => console.log(v) // returns "A", what it was called with.
  promiseB.then(v => console.log(v) // returns "C", the args on the stack when called
  promiseC.then(v => console.log(v) // returns "C", the args on the stack when called

  Obviously, this example is contrived and you should only use it for expensive operations. Read on for the options:

  enqueue options
    key - optional. the key to identify this queue so you can look it up later. If you do not provide a key and re-enqueue an identical function,
    you'll get a _separate_ queued function. Defaults to an arbitrary increasing integer
  delayOnce - boolean, optiona, defaults true. If true, and you have specified a delay, then will delay the FIRST invocation of the queued
    function. Otherwise, will delay before EVERY invocation, assuming there are no -pending- invocations. You probably want to just leave this alone.
  delay - numeric, defaults to 0. Now many ms to wait before invoking the function, when it's a fresh invocation and -not- a pending queued item.
  throttle - numeric, defaults to 100. How many ms to throttle subsequent invocations.
    So. If you have queued up a bunch of calls which will take 25ms each to run, and your throttle is 100ms. It will run the first invocation immediately and take
    25ms to complete. It will then wait an additional 75ms before running the second. This will take 25ms to complete, then wait 75ms for the third, and so on.
    If you have queued up a bunch of calls which take 150ms each to run, but the throttle is 100ms, then it will complete the first one and run the next immediately since
    it has already passed the throttle time.
  lastOnly - boolean. defaults true. Only keep the last pending invocation, or keep all of them.
    e.g.:
      // assume func takes 100ms to run.
      const queuedFuncA = enqueue(func, { lastOnly: true })
      const promiseA = queuedFuncA("A")
      const promiseB = queuedFuncA("B")
      const promiseC = queuedFuncA("C")

      promiseB will have its "B" arg replaced with "C", because we are only keeping the last value.

      If lastOnly is true (the default), then promiseB will be run with "B", and promiseC will be run with "C".
  resolution - how to handle pending promises. Defaults to SHARED. Can be SHARED, NOTHING, REJECT, or UNQUEUED.
    These options are exported in the QUEUE_RESOLUTION variable from this file.
    SHARED - if there are multiple pending calls, then each call is given the same promise immediately. The promise will be invoked with appropriate args.
    e.g.,
      const queuedFunc = enqueue(func)
      const promiseA = queuedFunc("A")
      const promiseB = queuedFunc("B")
      const promiseC = queuedFunc("C")
      // promiseA === promiseB === promiseC
    NOTHING - if there are multiple pending calls, then earlier calls will be ignored and never complete.
      e.g.,
        const queuedFunc = enqueue(func)
        const promiseA = queuedFunc("A")
        const promiseB = queuedFunc("B")
        const promiseC = queuedFunc("C")
        // promiseA !== promiseB !== promiseC
        // promiseA will resolve, since it's invoked immediately.
        // promiseB will be silently disposed of, since it was replaced by promiseC.
        // promiseC will be resolved once it fires.
      REJECT - if there are multiple pending calls, then earlier calls will be rejected.
        e.g.,
          const queuedFunc = enqueue(func)
          const promiseA = queuedFunc("A")
          const promiseB = queuedFunc("B")
          const promiseC = queuedFunc("C")
          // promiseA !== promiseB !== promiseC
          // promiseA will resolve, since it's invoked immediately.
          // promiseB will reject, since it was replaced by promiseC.
          // promiseC will be resolved once it fires.
      UNQUEUED - if the promises are unqueued, they will be fired off immediately w/o any queueing. You probably don't want to do this.
  shared - boolean. Defaults to true. If a queue is shared, then multiple functions can wire into it. If it is unshared, then the queue is only
    accessible to the enqueued function you have returned from enqueue, and nothin gelse.

  an enqueued function has several options hanging off of it as well:
    queuedFunc.queue - access to this function's queue. This should only be used for debugging purposes to see a current queue state - attempting to directly
      manipulate it may cause unintended consequences.
    queuedFunc.copy(newOptions) - clones a queuedFunction with new options. You only need to pass a delta of options you want to change from the original.
    queuedFunc.token(token) - this one is magical.
      Okay. So here's our explicit use case. ConnectorWithQueue creates a new queue per chart and stuffs all function invocations into it.
      BUT, you can't share all promises across all function invocations. Say, for example, that you have the minMaxQuery, countQuery, and actual dataQuery. They're all
      queued together so it runs minMax, then count, then data, but you can't share the promises across each other. You don't want a pending dataQuery to steal the countQuery's
      promise and return results into there. So you can tokenize it. A tokenized function just specifies an ID to identify the values in the queue. Individual tokens will
      still overwrite each other, depending upon the value of lastOnly, but not cross-tokens.
      e.g.,
        const queuedFunc = enqeue(func, {key : "queue"})
        const queuedFunc2 = enqeue(func2, {key : "queue"})
        const promiseA = queuedFunc("A") // this is not tokenized. Let's say it takes 100ms.
        const promiseB = queuedFunc2("B") // this is not tokenized. It is now pending in the queue
        const promiseC = queuedFunc("C") // this is not tokenized. It will replace promiseB - but this is bad! queuedFunc and queuedFunc2 may return
                                        // different incompatible values.
        instead. use a token.
        const promiseA = queuedFunc.token("func")("A") // this is tokenized. Let's say it takes 100ms.
        const promiseB = queuedFunc2.token("func2")("B") // this is tokenized. It is now pending in the queue and can only be overwritten by another token("func2") call
        const promiseC = queuedFunc.token("func")("C") // this is tokenized.  It is now pending in the queue and can only be overwritten by another token("func") call.
                                                      // it will not overwrite promiseB.

  The module also vends out some utility functions -
    getQueue(key) will return the queued function created for a given key.
    dequeue(key) will delete a function for a given key.
    clearQueues() will remove all queues.

  PLEASE NOTE - clearing a queue only removes the SHARED version. Any existing queued functions which reference a given queue will still have it until they are removed.
*/

import { makeDelayed } from "./delayed-function"
import { getPadlock } from "./padlock"

let id = 0

const queues = new Map()

export function dequeue(key) {
  queues.delete(key)
}

export function getQueue(key) {
  return queues.get(key)
}

export function clearQueues() {
  queues.clear()
}

const NOTHING = "nothing"
const SHARED = "shared"
const REJECT = "reject"
const UNQUEUED = "unqueued"

export const QUEUE_RESOLUTION = { NOTHING, SHARED, REJECT, UNQUEUED }

/*
  this will create the magic promises used internally by enqueue. it takes:
  func - the original function we enqeueued.
  padlock - a padlock to govern its arguments.
  fetchNext - a function to return the next pending invocation.
  delay - how long to delay before invocation.
  throttle - how long to throttle invocations.
*/

function createPromise({
  delayedFunc,
  padlock,
  fetchNext,
  delay = 0,
  throttle = 0
}) {
  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    let startTime = 0
    try {
      const args = await padlock
      startTime = Date.now()
      const res = await delayedFunc(delay)(...args)
      resolve(res)
    } catch (e) {
      reject(e)
    }
    const endTime = Date.now()
    const next = fetchNext()
    if (next) {
      const throttleTime = Math.max(throttle - (endTime - startTime), 0)
      next.unlock(throttleTime)(next.args)
    }
  })
}

/*
  options
    key - the key to this queue
    throttle - ms, run this function at most every x ms
    delay - when the throttle is clear, how many ms to wait until running
    delayOnce - should it be delayed only on initial run, or on all subsequent runs
    lastOnly - if true, only the last pending call executes. If false, they all do in sequence
    resolution - nothing, shared, reject, unqueued
*/

let queueKey = 0

export function enqueue(func, options = {}) {
  const {
    key = queueKey++,
    delayOnce = true,
    delay = 0,
    throttle = 100,
    lastOnly = true,
    resolution = SHARED,
    shared = true
  } = options

  // if we have a copy of this queue, return it. Otherwise, carry on.
  if (!queues.has(key)) {
    // a queue is active if it has any pending values.
    let isActive = false
    let hasDelayed = false
    // this is the actual queue of pending function calls.
    const personalQueue = []

    const delayedFunc = makeDelayed(func)

    // fetchNext will return the next value in the queue, or set the queue to inactive if there's nothing.
    const fetchNext = () => {
      if (personalQueue.length) {
        return personalQueue.shift()
      } else {
        isActive = false
        return null
      }
    }

    const tokenized = new Map()

    // the tokenizer establishes multiple "subqueues" based upon the token value. This ensures calls with different tokens don't overwrite.
    const tokenizer = (token) => {
      if (tokenized.get(token) === undefined) {
        const tokenFunc = (...args) => {
          const { padlock, unlock, fail } = getPadlock()
          const promise = createPromise({
            delayedFunc,
            padlock,
            fetchNext,
            delay: delayOnce ? 0 : delay,
            throttle
          })
          promise.id = id++

          const lastCallIndex = personalQueue.findIndex(
            (call) => call.token === token
          )

          personalQueue.push({
            unlock: makeDelayed(unlock),
            args,
            promise,
            fail,
            token
          })

          // if we're going to overwrite pending promises, do it according to the rules:
          if (lastOnly && lastCallIndex >= 0) {
            // shared promise? overwrite its original args with our own.
            if (resolution === SHARED) {
              const lastCall = personalQueue.pop()
              personalQueue[lastCallIndex].args = lastCall.args
              return personalQueue[lastCallIndex].promise
            } else if (resolution === NOTHING) {
              // just throw away the prior call. It'll never resolve.
              personalQueue.splice(lastCallIndex, 1)
            } else if (resolution === REJECT) {
              const pendingCall = personalQueue.splice(lastCallIndex, 1)[0]
              pendingCall.fail("replaced by later invocation")
            }
          }

          if (!isActive) {
            isActive = true
            const { unlock: nextUnlock, args: nextArgs } = fetchNext()
            nextUnlock(delayOnce && hasDelayed ? 0 : delay)(nextArgs)
            hasDelayed = true
          }

          return promise
        }
        tokenized.set(token, tokenFunc)
      }
      return tokenized.get(token)
    }

    // the generalTokenizer is what's actually returned - it is just a tokenizer, but with the function itself used as the token key.
    // that's just to be a reasonably unique value that cannot collide.
    const generalTokenizer = (...args) => tokenizer(func)(...args)
    generalTokenizer.token = tokenizer

    generalTokenizer.copy = (cloneOpts) =>
      enqueue(func, { ...options, ...cloneOpts })

    generalTokenizer.queue = personalQueue

    queues.set(key, generalTokenizer)
  }

  const queueFunc = queues.get(key)
  if (!shared) {
    queues.delete(key)
  }
  return queueFunc
}
