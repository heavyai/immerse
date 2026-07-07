// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface IIconTargetProps {
  width?: string
  height?: string
  className?: string
}

export const IconTarget: FC<IIconTargetProps> = ({
  width = "24",
  height = "24",
  className
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    viewBox="0 0 16 16"
    width={width}
    className={className}
  >
    <path d="M8 0c.416 0 .75.334.75.75v1.297a6.003 6.003 0 0 1 5.203 5.203h1.297c.416 0 .75.334.75.75s-.334.75-.75.75h-1.297a6.003 6.003 0 0 1-5.203 5.203v1.297c0 .416-.334.75-.75.75a.748.748 0 0 1-.75-.75v-1.297A6.003 6.003 0 0 1 2.047 8.75H.75A.748.748 0 0 1 0 8c0-.416.334-.75.75-.75h1.297A6.003 6.003 0 0 1 7.25 2.047V.75C7.25.334 7.584 0 8 0zM3.5 8a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0zm6 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zM5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" />
  </svg>
)
