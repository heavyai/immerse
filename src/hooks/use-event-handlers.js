// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useLayoutEffect, useMemo, useRef } from "react"

// Stable event functions read the most recently committed component inputs.
// Factories are local domain handlers, not components or render callbacks.
export function useEventHandlers(factories, props) {
  const committed = useRef({ factories, props })
  useLayoutEffect(() => {
    committed.current = { factories, props }
  })
  const keys = Object.keys(factories).sort().join("\n")
  return useMemo(
    () =>
      Object.fromEntries(
        keys
          .split("\n")
          .filter(Boolean)
          .map((name) => [
            name,
            (...args) => {
              const current = committed.current
              return current.factories[name](current.props)(...args)
            }
          ])
      ),
    [keys]
  )
}
