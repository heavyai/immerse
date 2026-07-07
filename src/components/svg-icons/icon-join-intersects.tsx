// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

export const IconJoinIntersects = ({
  className,
  testId
}: {
  className?: string
  testId?: string
}) => {
  return (
    <svg
      className={cx({ className: Boolean(className) }, "icon-join-intersects")}
      data-testid={testId || "icon-join-intersects"}
      width="53"
      height="52"
      viewBox="0 0 53 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9.93301"
        cy="18.85"
        r="5.2"
        stroke="#D9D9D9"
        strokeWidth="1.3"
      />
      <circle
        cx="26.8334"
        cy="33.15"
        r="5.2"
        stroke="#00A7B4"
        strokeWidth="1.3"
      />
      <circle cx="32.0326" cy="33.8" r="2.6" fill="#22EDD8" />
      <circle
        cx="43.7328"
        cy="18.85"
        r="5.2"
        stroke="#D9D9D9"
        strokeWidth="1.3"
      />
    </svg>
  )
}
