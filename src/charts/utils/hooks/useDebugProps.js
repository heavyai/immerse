// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from "react"

export const useDebugProps = (props, id = window.performance.now()) => {
  const oldProps = useRef(null)
  const [identity] = useState(id)

  // do nothing if you're in production, of course.
  if (process.env.NODE_ENV === "production") {
    return
  }

  if (oldProps.current !== null) {
    Object.entries(props).forEach(([prop, value]) => {
      if (value !== oldProps.current[prop]) {
        // eslint-disable-next-line
        console.log(
          `CHANGE ON ${identity} IN ${prop} : `,
          oldProps.current[prop],
          value
        )
      }
    })
  }

  oldProps.current = props
}
