// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"

export const IconGeometryTypePolygon = ({
  className,
  testId
}: {
  className: string
  testId: string
}) => {
  return (
    <svg
      className={cx({ className: Boolean(className) }, "icon-geom-type-line")}
      data-testid={testId || "icon-geom-type-line"}
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.21429C12 3.16106 11.2325 3.92857 10.2857 3.92857C10.1322 3.92857 9.98331 3.90838 9.8417 3.87051L3.37051 10.3417C3.40838 10.4833 3.42857 10.6322 3.42857 10.7857C3.42857 11.7325 2.66106 12.5 1.71429 12.5C0.767512 12.5 0 11.7325 0 10.7857C0 9.83894 0.767512 9.07143 1.71429 9.07143C1.86786 9.07143 2.01671 9.09162 2.15834 9.1295L8.6295 2.65834C8.59162 2.51671 8.57143 2.36786 8.57143 2.21429C8.57143 1.26751 9.33894 0.5 10.2857 0.5C11.2325 0.5 12 1.26751 12 2.21429Z"
        fill="#AAAAAA"
      />
    </svg>
  )
}
