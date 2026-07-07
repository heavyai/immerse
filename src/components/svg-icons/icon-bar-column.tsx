// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface Props {
  fillColor?: string
  className?: string
}

const BarColumnIcon: FC<Props> = ({ fillColor, className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.8 0H11.2V13.6H8.8V0ZM0 15.2H16V16H0V15.2ZM15.2 3.2H12.8V13.6H15.2V3.2ZM4.8 6.4H7.2V13.6H4.8V6.4ZM3.2 8H0.8V13.6H3.2V8Z"
      fill={fillColor}
    />
  </svg>
)

export default BarColumnIcon
