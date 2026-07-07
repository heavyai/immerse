// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import "./icon-sort.scss"

interface Props {
  sort: "asc" | "desc" | "ASC" | "DESC"
}

const SortIcon: FC<Props> = ({ sort = "DESC" }) => {
  const sortFormatted = sort.toLowerCase()
  return (
    <svg
      width="22"
      height="12"
      viewBox="0 0 22 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="sort-icon"
    >
      <path
        d="M3.27928 8.4625H0.737305L4.11272 11.5L7.48813 8.4625H4.94615V1H3.27928V8.4625Z"
        className={sortFormatted === "desc" ? "selected" : "unselected"}
      />
      <path
        d="M19.4121 3.5375H21.9541L18.5787 0.5L15.2033 3.5375H17.7453V11H19.4121V3.5375Z"
        className={sortFormatted === "asc" ? "selected" : "unselected"}
      />
    </svg>
  )
}

export default SortIcon
