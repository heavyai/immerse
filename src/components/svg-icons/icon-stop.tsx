// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

export const IconStop = ({
  className,
  fill = "#F6D7DE"
}: {
  className?: string
  fill?: string
}) => {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="16" fill="#BF3151" />
      <rect x="11" y="11" width="10" height="10" rx="2" fill={fill} />
    </svg>
  )
}
