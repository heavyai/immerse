// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconReplayPause = (props) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="16" cy="16" r="16" fill="#0089D1" />
    <g filter="url(#filter0_d_32_1246)">
      <path
        d="M19.3393 10.1871H18.375C17.5761 10.1871 16.9285 10.8347 16.9285 11.6065V20.285C16.9285 21.0839 17.5761 21.7315 18.375 21.7315L19.3393 21.7857C20.1381 21.7857 20.7857 21.1381 20.7857 20.3393V11.6607C20.7857 10.8618 20.1378 10.1871 19.3393 10.1871ZM13.5535 10.1871H12.5893C11.7904 10.1871 11.1428 10.8347 11.1428 11.6336V20.3121C11.1428 21.1378 11.7904 21.7857 12.5893 21.7857H13.5535C14.3524 21.7857 15 21.1381 15 20.3393V11.6607C15 10.8618 14.3521 10.1871 13.5535 10.1871Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_32_1246"
        x="2.85718"
        y="5.71428"
        width="28.5715"
        height="28.5714"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_32_1246"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_32_1246"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)

export default IconReplayPause
