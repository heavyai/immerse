// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, memo, ReactNode } from "react"
import { createPortal } from "react-dom"

const Portal = ({
  children,
  rootId,
  offsetTop = 0
}: {
  children: ReactNode
  rootId: string
  offsetTop: number
}) => {
  const mount = document.getElementById(rootId)
  const [container] = useState(document.createElement("div"))

  useEffect(() => {
    if (offsetTop) {
      container.style = `position: absolute; top: ${offsetTop}px;`
    }
    if (mount) {
      mount.appendChild(container)
      return () => {
        mount.removeChild(container)
      }
    }

    return () => {}
  }, [mount, container, offsetTop])

  return createPortal(children, container)
}

export default memo(Portal)
