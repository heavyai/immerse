// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import "./styles.scss"

type Props = {
  panelIcon: any
  panelTitle: string | Node
  panelDesc: string
}

const SettingsPanel: FC<Props> = ({
  panelIcon,
  panelTitle,
  panelDesc,
  children
}) => {
  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        {panelIcon ? panelIcon : null}
        {React.isValidElement(panelTitle) ? (
          panelTitle
        ) : (
          <h3 className="settings-panel-title">{panelTitle.toUpperCase()}</h3>
        )}
      </div>

      {panelDesc && (
        <div className="panel-description">
          <p className="text">{panelDesc}</p>
        </div>
      )}

      <div className="settings-panel-content">{children}</div>
    </div>
  )
}

export default SettingsPanel
