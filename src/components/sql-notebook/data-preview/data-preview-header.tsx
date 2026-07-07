// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ColumnTypeBadge } from "./column-type-badge"
import { ColumnBrowserRow } from "../data-panel/column-list-item"

import "./data-preview-header.scss"

export const DataPreviewHeader = ({ column }: { column: ColumnBrowserRow }) => {
  return (
    <div className="data-preview-header">
      <section className="data-preview-header__titles">
        <h1 className="data-preview-header__title">{column.value}</h1>
        <ColumnTypeBadge type={column.type} />
      </section>
      <section className="data-preview-header__category">
        <div className="data-preview-header__description">
          {column.comment ?? "No column comment available"}
        </div>
      </section>
    </div>
  )
}
