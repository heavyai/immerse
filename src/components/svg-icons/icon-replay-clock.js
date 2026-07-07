// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconReplayClock = (props) => (
  <svg
    width="18"
    height="22"
    viewBox="0 0 18 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_154_105)">
      <path
        d="M10.1719 2.25C10.6386 2.25 11.0156 2.62784 11.0156 3.09375C11.0156 3.55966 10.6386 3.9375 10.1719 3.9375H9.75V4.84585C10.7388 4.99746 11.6405 5.41406 12.3788 6.02051L12.951 5.45098C13.2806 5.12139 13.8132 5.12139 14.1428 5.45098C14.4724 5.78057 14.4724 6.31318 14.1428 6.64277L13.5073 7.28086C14.0663 8.13779 14.3906 9.16348 14.3906 10.2656C14.3906 13.2952 11.9358 15.75 8.90625 15.75C5.87666 15.75 3.42188 13.2952 3.42188 10.2656C3.42188 7.52344 5.43422 5.25059 8.0625 4.84585V3.9375H7.64062C7.17393 3.9375 6.79688 3.55966 6.79688 3.09375C6.79688 2.62784 7.17393 2.25 7.64062 2.25H10.1719ZM9.53906 7.3125C9.53906 6.96182 9.25693 6.67969 8.90625 6.67969C8.55557 6.67969 8.27344 6.96182 8.27344 7.3125V10.6875C8.27344 11.0382 8.55557 11.3203 8.90625 11.3203C9.25693 11.3203 9.53906 11.0382 9.53906 10.6875V7.3125Z"
        fill="#AAAAAA"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_154_105"
        x="-3"
        y="0"
        width="24"
        height="24"
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
        <feOffset dy="3" />
        <feGaussianBlur stdDeviation="1.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_154_105"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_154_105"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)

export default IconReplayClock
