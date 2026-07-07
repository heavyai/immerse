// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

export const IconJoinProximity = ({
  className,
  testId
}: {
  className: string
  testId: string
}) => {
  return (
    <svg
      className={cx({ className: Boolean(className) }, "icon-join-proximity")}
      data-testid={testId || "icon-join-proximity"}
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        opacity="0.15"
        cx="25.9999"
        cy="25.1334"
        r="14.7333"
        fill="#22EDD8"
      />
      <circle cx="26.0004" cy="25.1333" r="2.6" fill="#22EDD8" />
      <circle
        cx="25.9997"
        cy="25.1333"
        r="19.2833"
        stroke="#D9D9D9"
        strokeWidth="1.3"
      />
    </svg>
  )
}
