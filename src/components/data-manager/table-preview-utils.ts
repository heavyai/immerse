// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { numberWithCommas } from "utils/helpers"
import moment from "moment"
import { TTableRefreshInfo } from "@heavyai/connector/dist/browser-connector"

export const buildTablePreviewMetrics = ({
  columns = 0,
  rows,
  rowsImported,
  rowsRejected,
  importStartTime = 0,
  importEndTime = 0,
  isFsiConnectedSource = false,
  refreshInfo
}: {
  columns?: number
  rows?: number
  rowsImported?: number
  rowsRejected?: number
  importStartTime: string
  importEndTime: string
  isFsiConnectedSource: boolean
  refreshInfo?: TTableRefreshInfo
}) => {
  const metrics = [
    {
      label: "Columns",
      value: numberWithCommas(columns)
    },
    {
      label: "Rows",
      value: typeof rows === "number" ? numberWithCommas(rows) : undefined
    },
    {
      label: "Rows Imported",
      value:
        rowsImported !== undefined ? numberWithCommas(rowsImported) : undefined
    },
    {
      label: "Rows Rejected",
      value:
        rowsRejected !== undefined ? numberWithCommas(rowsRejected) : undefined,
      warning: rowsRejected && rowsRejected > 0
    },
    {
      label: "Total Import Time",
      value:
        importStartTime &&
        importEndTime &&
        moment
          .duration(
            Math.max(moment(importEndTime).diff(moment(importStartTime)), 0)
          )
          .format("hh:*mm:ss")
    }
  ]

  if (isFsiConnectedSource) {
    metrics.push({
      label: "Last Refreshed",
      value: refreshInfo.last_refresh_time
        ? moment(refreshInfo.last_refresh_time).format("MM/DD/YY HH:mm")
        : "-"
    })
    metrics.push({
      label: "Next Refresh",
      value: refreshInfo.next_refresh_time
        ? moment(refreshInfo.next_refresh_time).format("MM/DD/YY HH:mm")
        : "-"
    })
  }

  return metrics
}
