// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import SortIcon from "components/svg-icons/icon-sort"

import "./styles.scss"

type LowerCaseOrder = "asc" | "desc"
type UpperCaseOrder = "ASC" | "DESC"
type Order = LowerCaseOrder | UpperCaseOrder

interface Props {
  order?: Order
  setOrder: (order: UpperCaseOrder) => void
}

// This is written so it can accept either lowercase orders ("asc" and "desc")
// or uppercase orders ("ASC" and "DESC").
const SortOrderWidget: FC<Props> = ({ order, setOrder }) => {
  const upperCaseOrder = (order
    ? order.toUpperCase()
    : "DESC") as UpperCaseOrder
  return (
    <div
      className={`sort-order-widget`}
      onClick={() => setOrder(upperCaseOrder === "DESC" ? "ASC" : "DESC")}
    >
      <div className="sort-icon">
        <SortIcon sort={upperCaseOrder} />
      </div>
      <div className="sort-label">{upperCaseOrder}</div>
    </div>
  )
}

export default SortOrderWidget
