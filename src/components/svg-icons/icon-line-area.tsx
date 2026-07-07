// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface Props {
  fillColor?: string
  className?: string
}

const LineAreaIcon: FC<Props> = ({ fillColor, className }) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.2829 5.70984L11.2829 4.60328L15.4429 0L15.5229 0.132787L16.9229 1.68197V3.73062L15.4429 2.04487L10.2829 7.73394L7.08285 5.92485L2.70264 10.8H0.922852V10.7557L2.08285 9.42787L7.08285 3.93934L9.00285 5.00164L10.2829 5.70984ZM10.2829 10.5328L11.2829 9.34426L15.4429 4.4L15.5229 4.54262L16.9229 6.20656V16H0.922852V15.9525L2.08285 14.5262L7.08285 8.63115L9.00285 9.77213L10.2829 10.5328Z"
      fill={fillColor}
    />
  </svg>
)

export default LineAreaIcon
