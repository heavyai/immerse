// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type IconProps = {
  className?: string
}
const IconDataRows: FC<IconProps> = ({ className }: IconProps) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 5C4 1.82436 6.57436 1.25 9.75 1.25H15.75C18.9256 1.25 21.5 1.82436 21.5 5V19C21.5 22.1756 18.9256 22.75 15.75 22.75H9.75C6.57436 22.75 4 22.1756 4 19V5ZM9.75 2.75C7.40279 2.75 5.5 2.65279 5.5 5V19C5.5 21.3472 7.40279 21.25 9.75 21.25H15.75C18.0972 21.25 20 21.3472 20 19V5C20 2.65279 18.0972 2.75 15.75 2.75H9.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.5 8.75C21.5 9.16421 21.1642 9.5 20.75 9.5L5.75 9.5C5.33578 9.5 5 9.16421 5 8.75C5 8.33579 5.33578 8 5.75 8L20.75 8C21.1642 8 21.5 8.33579 21.5 8.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.5 15.75C21.5 16.1642 21.1642 16.5 20.75 16.5L5.75 16.5C5.33578 16.5 5 16.1642 5 15.75C5 15.3358 5.33578 15 5.75 15L20.75 15C21.1642 15 21.5 15.3358 21.5 15.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 6.75C10 7.16421 9.66421 7.5 9.25 7.5L7.25 7.5C6.83579 7.5 6.5 7.16421 6.5 6.75C6.5 6.33579 6.83579 6 7.25 6L9.25 6C9.66421 6 10 6.33579 10 6.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 12.75C10 13.1642 9.66421 13.5 9.25 13.5L7.25 13.5C6.83579 13.5 6.5 13.1642 6.5 12.75C6.5 12.3358 6.83579 12 7.25 12L9.25 12C9.66421 12 10 12.3358 10 12.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 18.75C10 19.1642 9.66421 19.5 9.25 19.5L7.25 19.5C6.83579 19.5 6.5 19.1642 6.5 18.75C6.5 18.3358 6.83579 18 7.25 18L9.25 18C9.66421 18 10 18.3358 10 18.75Z"
    />
  </svg>
)

export default IconDataRows
