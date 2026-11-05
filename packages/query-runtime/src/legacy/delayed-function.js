// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  given a function, will return a function generator that takes a delay before invoking.
   const func = (a,b,c) => {...}
   const delayedFunc = makeDelayed(func)
   delayedFunc(500)(a,b,c)  // will call func(a,b,c) after 500 ms
   delayedFunc(1000)(a,b,c) // will call func(a,b,c) after 1000 ms
   delayedFunc(0)(a,b,c)    // will call func(a,b,c) immediately w/o delay. NOTE - no promises are used here and it invokes immediately.
                            // delay of (0) is the same as calling func(a,b,c) directly.
*/

import { sleep } from "./sleep"

export function makeDelayed(f) {
  return (delay) => {
    return async (...args) => {
      if (delay > 0) {
        await sleep(delay)
      }

      return f(...args)
    }
  }
}
