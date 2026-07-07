// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const UnpinIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.74074 0.666667V0H7.92593V0.666667H7.18518V2.92307L3.48148 1.91297V0.666667H2.74074ZM3.48148 2.9495V4.66667H2.74074V5.33333H2V6H3.48148H4.96296V10L5.33681 10.6667L5.7037 10V6H7.18518H8.66667V5.33333H7.92593V4.66667H7.18518V3.9596L3.48148 2.9495Z"
      fill="#777777"
    />
    <line
      x1="0.071837"
      y1="0.760543"
      x2="10.0718"
      y2="3.76054"
      stroke="#777777"
      strokeWidth="0.5"
    />
  </svg>
)

const PinIcon = (
  <svg
    width="8"
    height="12"
    viewBox="0 0 8 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.40743 0.666748V1.33341H2.14817V5.33341H1.40743V6.00008H0.666687V6.66675H2.14817H3.62965V10.6667L4.0035 11.3334L4.37039 10.6667V6.66675H5.85187H7.33335V6.00008H6.59261V5.33341H5.85187V1.33341H6.59261V0.666748H1.40743Z"
      fill="#777777"
    />
  </svg>
)

export const PinToggle = ({ handleToggle, classNames, isPinned }) => (
  <div className={classNames || "inline-icon pin"} onClick={handleToggle}>
    {isPinned ? UnpinIcon : PinIcon}
  </div>
)
