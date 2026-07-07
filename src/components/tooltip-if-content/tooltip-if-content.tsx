// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Tooltip, TooltipProps } from "@rmwc/tooltip"

export const TooltipIfContent = (props: TooltipProps) => {
  return props.content ? (
    <Tooltip {...props}>{props.children}</Tooltip>
  ) : (
    <>{props.children}</>
  )
}
