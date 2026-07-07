// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

interface Props {
  className?: string
}

export const IconTrashOutline: FC<Props> = ({ className }) => (
  <svg
    width="18"
    height="20"
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 3.75C0 3.33579 0.335786 3 0.75 3H17.25C17.6642 3 18 3.33579 18 3.75C18 4.16421 17.6642 4.5 17.25 4.5H0.75C0.335786 4.5 0 4.16421 0 3.75Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 7.5C7.16421 7.5 7.5 7.83579 7.5 8.25V14.25C7.5 14.6642 7.16421 15 6.75 15C6.33579 15 6 14.6642 6 14.25V8.25C6 7.83579 6.33579 7.5 6.75 7.5Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.25 7.5C11.6642 7.5 12 7.83579 12 8.25V14.25C12 14.6642 11.6642 15 11.25 15C10.8358 15 10.5 14.6642 10.5 14.25V8.25C10.5 7.83579 10.8358 7.5 11.25 7.5Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.25 3C2.66421 3 3 3.33579 3 3.75V18H15V3.75C15 3.33579 15.3358 3 15.75 3C16.1642 3 16.5 3.33579 16.5 3.75V18C16.5 18.3978 16.342 18.7794 16.0607 19.0607C15.7794 19.342 15.3978 19.5 15 19.5H3C2.60218 19.5 2.22065 19.342 1.93934 19.0607C1.65804 18.7794 1.5 18.3978 1.5 18V3.75C1.5 3.33579 1.83579 3 2.25 3Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.15901 0.65901C5.58097 0.237053 6.15326 0 6.75 0H11.25C11.8467 0 12.419 0.237053 12.841 0.65901C13.2629 1.08097 13.5 1.65326 13.5 2.25V3.75C13.5 4.16421 13.1642 4.5 12.75 4.5C12.3358 4.5 12 4.16421 12 3.75V2.25C12 2.05109 11.921 1.86032 11.7803 1.71967C11.6397 1.57902 11.4489 1.5 11.25 1.5H6.75C6.55109 1.5 6.36032 1.57902 6.21967 1.71967C6.07902 1.86032 6 2.05109 6 2.25V3.75C6 4.16421 5.66421 4.5 5.25 4.5C4.83579 4.5 4.5 4.16421 4.5 3.75V2.25C4.5 1.65326 4.73705 1.08097 5.15901 0.65901Z"
    />
  </svg>
)
