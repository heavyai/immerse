// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface Props {
  className?: string
}

export const IconSaveOutline: FC<Props> = ({ className }) => (
  <svg
    width="18"
    height="19"
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M17.565 5.00375L13.4944 0.934062C13.2131 0.65375 12.84 0.5 12.4462 0.5H1.5C0.673125 0.5 0 1.17312 0 2V17C0 17.8269 0.673125 18.5 1.5 18.5H16.5C17.3269 18.5 18 17.8269 18 17V6.06031C18.0009 5.6675 17.8425 5.28312 17.565 5.00375ZM12.75 17H5.25V11.75H12.75V17ZM16.5 17H14.25V11.75C14.25 10.9231 13.5769 10.25 12.75 10.25H5.25C4.42312 10.25 3.75 10.9231 3.75 11.75V17H1.5V2L12.435 1.99625L16.5 6.06125V17.0009V17Z" />
    <path d="M11.25 3.5H6C5.58562 3.5 5.25 3.83562 5.25 4.25C5.25 4.66437 5.58562 5 6 5H11.25C11.6644 5 12 4.66437 12 4.25C12 3.83562 11.6644 3.5 11.25 3.5Z" />
  </svg>
)
