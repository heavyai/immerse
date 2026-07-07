// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type IconProps = {
  className?: string
}
const IconChart: FC<IconProps> = ({ className }: IconProps) => (
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
      d="M2.25 8C2.25 4.82436 4.82436 2.25 8 2.25H16C19.1756 2.25 21.75 4.82436 21.75 8V16C21.75 19.1756 19.1756 21.75 16 21.75H8C4.82436 21.75 2.25 19.1756 2.25 16V8ZM8 3.75C5.65279 3.75 3.75 5.65279 3.75 8V16C3.75 18.3472 5.65279 20.25 8 20.25H16C18.3472 20.25 20.25 18.3472 20.25 16V8C20.25 5.65279 18.3472 3.75 16 3.75H8Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 11.25C8.41421 11.25 8.75 11.5858 8.75 12V17C8.75 17.4142 8.41421 17.75 8 17.75C7.58579 17.75 7.25 17.4142 7.25 17V12C7.25 11.5858 7.58579 11.25 8 11.25Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 8.25C12.4142 8.25 12.75 8.58579 12.75 9L12.75 17C12.75 17.4142 12.4142 17.75 12 17.75C11.5858 17.75 11.25 17.4142 11.25 17L11.25 9C11.25 8.58579 11.5858 8.25 12 8.25Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 14.25C16.4142 14.25 16.75 14.5858 16.75 15L16.75 17C16.75 17.4142 16.4142 17.75 16 17.75C15.5858 17.75 15.25 17.4142 15.25 17L15.25 15C15.25 14.5858 15.5858 14.25 16 14.25Z"
    />
  </svg>
)

export default IconChart
