// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface IChevronDownIconProps {
  className?: string
  width?: number
  height?: number
}

export const ChevronDownIcon: FC<IChevronDownIconProps> = ({
  className,
  width = 14,
  height = 14
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <g>
      <path d="M7.61787 11.118C7.27607 11.4598 6.721 11.4598 6.3792 11.118L1.1292 5.86798C0.787403 5.52618 0.787403 4.9711 1.1292 4.62931C1.471 4.28751 2.02608 4.28751 2.36787 4.62931L6.9999 9.26134L11.6319 4.63204C11.9737 4.29025 12.5288 4.29025 12.8706 4.63204C13.2124 4.97384 13.2124 5.52892 12.8706 5.87072L7.62061 11.1207L7.61787 11.118Z" />
    </g>
  </svg>
)
