// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type IconProps = {
  className?: string
}
export const IconConsole: FC<IconProps> = ({ className }: IconProps) => {
  return (
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
        d="M1.25 8C1.25 4.82436 3.82436 2.25 7 2.25H17C20.1756 2.25 22.75 4.82436 22.75 8V16C22.75 19.1756 20.1756 21.75 17 21.75H7C3.82436 21.75 1.25 19.1756 1.25 16V8ZM7 3.75C4.65279 3.75 2.75 5.65279 2.75 8V16C2.75 18.3472 4.65279 20.25 7 20.25H17C19.3472 20.25 21.25 18.3472 21.25 16V8C21.25 5.65279 19.3472 3.75 17 3.75H7Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 16C17 16.5523 16.6162 17 16.1429 17L12.8571 17C12.3838 17 12 16.5523 12 16C12 15.4477 12.3838 15 12.8571 15L16.1429 15C16.6162 15 17 15.4477 17 16Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.16031 8.33539C7.39102 8.07904 7.78586 8.05826 8.04221 8.28897L11.5177 11.4169C12.1608 11.9957 12.1608 13.0041 11.5177 13.5829L8.04221 16.7108C7.78586 16.9416 7.39102 16.9208 7.16031 16.6644C6.9296 16.4081 6.95038 16.0132 7.20672 15.7825L10.6822 12.6546C10.774 12.5719 10.774 12.4279 10.6822 12.3452L7.20672 9.21729C6.95038 8.98658 6.9296 8.59174 7.16031 8.33539Z"
      />
    </svg>
  )
}
