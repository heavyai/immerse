// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

export const IconGeometryTypePoint = ({
  className,
  testId
}: {
  className: string
  testId: string
}) => {
  return (
    <svg
      className={cx({ className: Boolean(className) }, "icon-geom-type-point")}
      data-testid={testId || "icon-geom-type-point"}
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.1429 6.5C11.1429 9.34032 8.84032 11.6429 6 11.6429C3.15968 11.6429 0.857143 9.34032 0.857143 6.5C0.857143 3.65968 3.15968 1.35714 6 1.35714C8.84032 1.35714 11.1429 3.65968 11.1429 6.5ZM12 6.5C12 9.81371 9.31371 12.5 6 12.5C2.68629 12.5 0 9.81371 0 6.5C0 3.18629 2.68629 0.5 6 0.5C9.31371 0.5 12 3.18629 12 6.5ZM6 9.07143C7.42016 9.07143 8.57143 7.92016 8.57143 6.5C8.57143 5.07984 7.42016 3.92857 6 3.92857C4.57984 3.92857 3.42857 5.07984 3.42857 6.5C3.42857 7.92016 4.57984 9.07143 6 9.07143Z"
        fill="#AAAAAA"
      />
    </svg>
  )
}
