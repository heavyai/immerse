// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  a padlock is a promise which can be resolved at any time to hand arguments into a function.
  e.g.,

  async function f(padlock) {
    return new Promise( (resolve, reject) => {
      const args = await padlock
      console.log("invoked with args: ", args)
      // do interesting things with args
    })
  }

  const { padlock, unlock } = getPadlock()
  const pendingPromise = f(padlock)
  // you now have a pendingPromise. This can be handed into anything expecting a promise, even if you don't know
  // the arguments you want to call it with yet.
  At some point later, you can call:
  unlock(["A","B", "C"])
  and ["A", "B", "C"] will be handed into that pendingPromise and you can do what you want with it, then resolve at your leisure.
}
*/

export function getPadlock() {
  let unlock = null
  let fail = null
  const padlock = new Promise((resolve, reject) => {
    unlock = resolve
    fail = reject
  })

  return { padlock, unlock, fail }
}
