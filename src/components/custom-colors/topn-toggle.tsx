// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import IconDynamic from "components/svg-icons/icon-dynamic"
import IconLock from "components/svg-icons/icon-lock"

type Props = {
  lockedTopN: boolean
  onUnlockTopN: () => void
}

const TopNToggle: FC<Props> = ({ lockedTopN, onUnlockTopN }) =>
  lockedTopN ? (
    <div
      className="chart-editor-topN-lock-toggle"
      onClick={onUnlockTopN}
      title="Fixed color selections"
    >
      <div
        className={
          "chart-editor-topN-lock-toggle-selected-background" +
          " chart-editor-topN-lock-toggle-selected-background-locked"
        }
      />
      <div className="chart-editor-topN-lock-toggle-inner" />
      <IconLock
        className={
          "chart-editor-topN-lock-toggle-locked-icon" +
          " chart-editor-topN-lock-toggle-selected-icon"
        }
      />
      <IconDynamic className="chart-editor-topN-lock-toggle-dynamic-icon" />
    </div>
  ) : (
    <div
      className="chart-editor-topN-lock-toggle"
      title="Dynamic color selections"
    >
      <div
        className={[
          "chart-editor-topN-lock-toggle-selected-background",
          "chart-editor-topN-lock-toggle-selected-background-dynamic"
        ].join(" ")}
      />
      <div className="chart-editor-topN-lock-toggle-inner" />
      <IconLock className="chart-editor-topN-lock-toggle-locked-icon" />
      <IconDynamic className="chart-editor-topN-lock-toggle-dynamic-icon chart-editor-topN-lock-toggle-selected-icon" />
    </div>
  )

export default TopNToggle
