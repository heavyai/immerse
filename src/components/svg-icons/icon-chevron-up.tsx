// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface IChevronUpIconProps {
  className?: string
  defaultFill?: boolean
  width?: number
  height?: number
}

export const ChevronUpIcon: FC<IChevronUpIconProps> = ({
  className,
  defaultFill = true,
  width = 11,
  height = 6
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 11 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.06208 4.35665L4.92807 0.558144C5.08557 0.403394 5.2936 0.328551 5.49997 0.333615C5.70635 0.328551 5.91438 0.403394 6.07188 0.558144L9.93787 4.35665C10.2429 4.65634 10.2429 5.14224 9.93787 5.44194C9.63285 5.74163 9.13832 5.74163 8.8333 5.44194L5.49997 2.1668L2.16665 5.44194C1.86163 5.74163 1.3671 5.74163 1.06208 5.44194C0.757058 5.14224 0.757058 4.65634 1.06208 4.35665Z"
      fill={defaultFill ? "#BBBBBB" : undefined}
    />
  </svg>
)
