// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { SimpleListItem } from "@rmwc/list"
import { List } from "widgets/list/List"
import { ColumnAggregateExpression } from "vega/constants/data-selection-types"
import { AggOptionProp } from "vega/components/SelectorSubComponent/AggregateSubComponent"

import "./styles.scss"

type Props = {
  listSizeClass?: string
  options: AggOptionProp[]
  measure: ColumnAggregateExpression
  updateAggregate: (o: AggOptionProp) => void
}

const AggregateComponent: FC<Props> = ({
  listSizeClass,
  options,
  measure,
  updateAggregate
}) => {
  return (
    <div className="aggregate-container">
      <List compact={listSizeClass === "compact"}>
        {options.map((o, i) => (
          <SimpleListItem
            key={i}
            text={o.label}
            onMouseDown={() => updateAggregate(o)}
            selected={measure && measure.aggregate === o.value}
          />
        ))}
      </List>
    </div>
  )
}

export default AggregateComponent
