// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useRef } from "react"
import deepEquals from "fast-deep-equal"

export const useStaticValue = (value) => {
  const staticValue = useRef(value)

  if (!deepEquals(staticValue.current, value)) {
    staticValue.current = value
  }

  return staticValue.current
}
