// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import cx from "classnames"
import { List as RMWCList } from "@rmwc/list"

import "./list.scss"

/**
 * List properties.
 */
export interface IListProps {
  /** Content specified as children. */
  children?: [React.ReactNode]
  className?: string
  /** Reduce list item padding */
  compact?: boolean
  extraCompact?: boolean
}

/**
 * List
 */
export const List = (props: IListProps) => {
  const { compact, extraCompact, children, className, ...rest } = props
  const newClassNames = cx(className, {
    compact: props.compact,
    "extra-compact": props.extraCompact
  })

  return (
    <RMWCList {...rest} className={newClassNames}>
      {props.children}
    </RMWCList>
  )
}

export default List
