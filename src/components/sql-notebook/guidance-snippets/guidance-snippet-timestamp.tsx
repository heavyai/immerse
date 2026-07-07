// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import moment from "moment/moment"
import "moment-timezone"

import "./guidance-snippet-timestamp.scss"

export const GuidanceSnippetTimestamp = ({
  timestamp
}: {
  timestamp: moment.Moment
}) => {
  const formattedTimestamp = timestamp.local().format("MMMM DD YYYY HH:mm")
  return (
    <span className="guidance-snippets__timestamp">{formattedTimestamp}</span>
  )
}
