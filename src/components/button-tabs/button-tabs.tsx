// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { RefAttributes } from "react"
import classNames from "classnames"
import { CollapsibleResultRef } from "components/sql-notebook/results/collapsible-result"
import { ResultAnalysisCell, ResultTabKey } from "components/sql-notebook/types"
import "./button-tabs.scss"

type SimpleComponent = (props: any) => JSX.Element
type ComponentType =
  | React.ForwardRefExoticComponent<
      { cell: ResultAnalysisCell } & RefAttributes<CollapsibleResultRef>
    >
  | SimpleComponent

export type ButtonTab<T> = {
  label: string
  Component?: ComponentType
  show: (t: T, iqEnabled: boolean) => boolean
  value: string
}

export const ButtonTabs = <T,>({
  tabs = [],
  activeTab,
  onActiveTabChange,
  dense = false
}: {
  tabs: Array<ButtonTab<T>>
  activeTab: string | ResultTabKey
  onActiveTabChange: (value: string | ResultTabKey) => void
  dense: boolean
}) => {
  return (
    <div className={classNames("button-tabs", { dense })} role="tablist">
      {tabs.map((tab) => {
        const selected = activeTab === tab.value
        return (
          <div
            role="tab"
            aria-selected={selected}
            key={tab.value}
            onClick={() => onActiveTabChange(tab.value)}
            className={classNames("button-tabs-tab", {
              selected
            })}
          >
            {tab.label}
          </div>
        )
      })}
    </div>
  )
}
