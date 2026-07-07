// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface Props {
  className?: string
  width?: string
  height?: string
}

export const GripIcon: FC<Props> = ({
  className,
  width = "7",
  height = "14"
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 7 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 0.5C0.447715 0.5 0 0.947715 0 1.5V2.5C0 3.05228 0.447715 3.5 1 3.5H2C2.55228 3.5 3 3.05228 3 2.5V1.5C3 0.947715 2.55228 0.5 2 0.5H1ZM5 0.5C4.44772 0.5 4 0.947715 4 1.5V2.5C4 3.05228 4.44772 3.5 5 3.5H6C6.55228 3.5 7 3.05228 7 2.5V1.5C7 0.947715 6.55228 0.5 6 0.5H5ZM4 6.5C4 5.94772 4.44772 5.5 5 5.5H6C6.55228 5.5 7 5.94772 7 6.5V7.5C7 8.05228 6.55228 8.5 6 8.5H5C4.44772 8.5 4 8.05228 4 7.5V6.5ZM1 5.5C0.447715 5.5 0 5.94772 0 6.5V7.5C0 8.05228 0.447715 8.5 1 8.5H2C2.55228 8.5 3 8.05228 3 7.5V6.5C3 5.94772 2.55228 5.5 2 5.5H1ZM0 11.5C0 10.9477 0.447715 10.5 1 10.5H2C2.55228 10.5 3 10.9477 3 11.5V12.5C3 13.0523 2.55228 13.5 2 13.5H1C0.447715 13.5 0 13.0523 0 12.5V11.5ZM5 10.5C4.44772 10.5 4 10.9477 4 11.5V12.5C4 13.0523 4.44772 13.5 5 13.5H6C6.55228 13.5 7 13.0523 7 12.5V11.5C7 10.9477 6.55228 10.5 6 10.5H5Z"
    />
  </svg>
)
