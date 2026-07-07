// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useMemo } from "react"
import { GuidanceSnippetsPanel } from "../guidance-snippets/guidance-snippets-panel"
import { SqlNotebookDataPanel } from "../data-panel/sql-notebook-data-panel"
import { LeftPanelTab } from "./left-panel-tab"
import { LeftPanelTabKey } from "../types"
import { useIQEnabled } from "../hooks/useIQEnabled"
import "./left-panel.scss"

export const LeftPanel = ({
  insertAtCursor,
  hasActiveEditor
}: {
  insertAtCursor: (value: string) => void
  hasActiveEditor: boolean
}) => {
  const [activeTab, setActiveTab] = useState(LeftPanelTabKey.DATA)
  const iqEnabled = useIQEnabled()

  const TABS = useMemo(() => {
    return [
    { label: "Table Browser", key: LeftPanelTabKey.DATA },
    { label: "Guidance", key: LeftPanelTabKey.GUIDANCE, enabled: iqEnabled }
  ]}, [iqEnabled])

  // eslint-disable-next-line init-declarations
  let activePanel
  switch (activeTab) {
    case LeftPanelTabKey.GUIDANCE:
      activePanel = <GuidanceSnippetsPanel />
      break
    case LeftPanelTabKey.DATA:
    default:
      activePanel = (
        <SqlNotebookDataPanel
          insertAtCursor={insertAtCursor}
          hasActiveEditor={hasActiveEditor}
        />
      )
  }

  return (
    <div className={"sql-notebook-left-panel"}>
      <div className="sql-notebook-left-panel__tabs">
        {TABS.filter(({enabled}) => enabled !== false).map(({ label, key }) => (
          <LeftPanelTab
            label={label}
            tabKey={key}
            key={key}
            activeTabKey={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
      {activePanel}
    </div>
  )
}
