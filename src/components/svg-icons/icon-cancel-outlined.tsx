// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

// Note that this is the same as outlined variant of the material cancel icon.
// It can be replaced if material-design-icons ever gets it together and updates
// its npm package.
// https://github.com/google/material-design-icons/issues/1129
const CancelOutlinedIcon = () => (
  <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.332 5.332l5.333 5.333M5.332 10.668l5.333-5.333"
      stroke="#AAA"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="replace-stroke"
    />
    <circle
      cx="8"
      cy="8"
      r="7.25"
      stroke="#AAA"
      strokeWidth="1.5"
      className="replace-stroke"
    />
  </svg>
)

export default CancelOutlinedIcon
