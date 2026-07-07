// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface IIconUndoProps {
  width?: string
  height?: string
  className?: string
}

export const IconUndo: FC<IIconUndoProps> = ({
  width = "15",
  height = "14",
  className
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 15 14"
    className={className}
  >
    <path d="M0.4375 0.5625C0.71875 0.46875 1.0625 0.53125 1.25 0.75L2.5625 2.03125C3.84375 0.75 5.59375 0 7.46875 0C11.3438 0.03125 14.5 3.15625 14.5 7C14.5 10.875 11.3438 14 7.5 14C5.84375 14 4.25 13.4375 3 12.4062C2.6875 12.125 2.65625 11.6562 2.90625 11.3438C3.1875 11.0312 3.65625 10.9688 3.96875 11.25C4.9375 12.0625 6.1875 12.5 7.5 12.5C10.5312 12.5 13 10.0625 13 7C13 3.96875 10.5312 1.5 7.5 1.5C6 1.5 4.65625 2.125 3.625 3.09375L5.25 4.75C5.46875 4.9375 5.53125 5.28125 5.4375 5.5625C5.3125 5.84375 5.03125 6 4.75 6H0.75C0.3125 6 0 5.6875 0 5.25V1.25C0 0.96875 0.15625 0.6875 0.4375 0.5625Z" />
  </svg>
)
