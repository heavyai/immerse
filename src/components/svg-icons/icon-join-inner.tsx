// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const IconJoinInner = ({
  className = "icon-join-inner",
  testId = "icon-join-inner"
}: {
  className: string
  testId: string
}) => (
  <svg
    width="20"
    height="14"
    viewBox="0 0 20 14"
    className={className}
    data-testid={testId}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 7C20 10.866 16.866 14 13 14C9.13401 14 6 10.866 6 7C6 3.13401 9.13401 0 13 0C16.866 0 20 3.13401 20 7ZM13 13C16.3137 13 19 10.3137 19 7C19 3.68629 16.3137 1 13 1C9.68629 1 7 3.68629 7 7C7 10.3137 9.68629 13 13 13Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0C10.866 0 14 3.13401 14 7ZM7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 12.1973C11.7934 11.1599 13 9.22085 13 7C13 4.77915 11.7934 2.84016 10 1.80273C8.2066 2.84016 7 4.77915 7 7C7 9.22085 8.2066 11.1599 10 12.1973Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 12.9675L9.66618 12.7744C7.67525 11.6227 6.33333 9.46848 6.33333 7.00003C6.33333 4.53159 7.67525 2.37735 9.66618 1.22566L10 1.03255L10.3338 1.22566C12.3247 2.37735 13.6667 4.53159 13.6667 7.00003C13.6667 9.46848 12.3247 11.6227 10.3338 12.7744L10 12.9675ZM10 12.1973C8.2066 11.1599 7 9.22085 7 7C7 4.77915 8.2066 2.84016 10 1.80273C11.7934 2.84016 13 4.77915 13 7C13 9.22085 11.7934 11.1599 10 12.1973Z"
    />
  </svg>
)

export default IconJoinInner
