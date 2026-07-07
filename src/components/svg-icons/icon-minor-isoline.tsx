// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import "./icon-isoline.scss"

const IconMinorIsoline: FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="isoline"
  >
    <g id="minor-isoline">
      <rect
        id="Rec"
        x="2"
        y="5"
        width="1"
        height="8"
        rx="0.5"
        fill="white"
        fillOpacity="0.45"
      />
      <rect
        id="Rec_2"
        x="15"
        y="5"
        width="1"
        height="8"
        rx="0.5"
        fill="white"
        fillOpacity="0.45"
      />
      <rect id="Rec_3" x="6" y="3" width="2" height="12" rx="1" fill="white" />
      <rect id="Rec_4" x="10" y="3" width="2" height="12" rx="1" fill="white" />
    </g>
  </svg>
)

export default IconMinorIsoline
