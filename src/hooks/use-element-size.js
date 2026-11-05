// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useLayoutEffect, useRef, useState } from "react"

export function MeasuredContainer({ children, onResize }) {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: null, height: null })
  useLayoutEffect(() => {
    let active = true
    let previous = null
    const update = () => {
      if (!active || !ref.current) {
        return
      }
      const { width, height } = ref.current.getBoundingClientRect()
      if (!previous || previous.width !== width || previous.height !== height) {
        previous = { width, height }
        setSize(previous)
        onResize?.(previous)
      }
    }
    const observer = new ResizeObserver(update)
    observer.observe(ref.current)
    update()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [onResize])
  return (
    <div className="grid-layout-wrapper" ref={ref}>
      {children({ size })}
    </div>
  )
}
