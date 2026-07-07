// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconReplayPlay = (props) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="16" cy="16" r="16" fill="#0089D1" />
    <g filter="url(#filter0_d_32_531)">
      <path
        d="M23.5773 14.5891C24.0698 14.8922 24.3695 15.4261 24.3695 16.0013C24.3695 16.5765 24.0698 17.1104 23.5773 17.3825L13.6583 23.4448C13.1478 23.7858 12.5089 23.7995 11.9874 23.5068C11.4658 23.214 11.1428 22.6629 11.1428 22.0635V9.93907C11.1428 9.34112 11.4658 8.78966 11.9874 8.49688C12.5089 8.20445 13.1478 8.21651 13.6583 8.52823L23.5773 14.5891Z"
        fill="white"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_32_531"
        x="3.42861"
        y="5.71429"
        width="27.4287"
        height="27.4286"
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
        <feOffset dy="3.42857" />
        <feGaussianBlur stdDeviation="1.71429" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_32_531"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_32_531"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)

export default IconReplayPlay
