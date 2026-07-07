// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./map-popup.scss"
import { SimpleDataTable } from "@rmwc/data-table"

type PopupInfo = {
  x: number
  y: number
  data: Record<string, string | number>
}

export const MapPopup = ({ data, x, y }: PopupInfo) => {
  const dataRows = Object.entries(data)
  return (
    <div
      className="sql-notebook-map-popup"
      style={{
        left: x,
        bottom: y
      }}
    >
      <SimpleDataTable data={dataRows} />
    </div>
  )
}
