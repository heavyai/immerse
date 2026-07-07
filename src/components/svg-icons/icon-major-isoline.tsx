// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import "./icon-isoline.scss"

const IconMajorIsoline: FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="isoline"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="14" y="3" width="2" height="12" rx="1" fill="white" />
    <rect x="2" y="3" width="2" height="12" rx="1" fill="white" />
    <rect
      opacity="0.65"
      x="7"
      y="5"
      width="1"
      height="8"
      rx="0.5"
      fill="white"
    />
    <rect
      opacity="0.65"
      x="10"
      y="5"
      width="1"
      height="8"
      rx="0.5"
      fill="white"
    />
  </svg>
)

export default IconMajorIsoline
