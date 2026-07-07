// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import LeftArrowIcon from "components/svg-icons/icon-left-arrow"
import { process } from "utils/ImmerseSQLPlusPlus/parser"

import cx from "classnames"

import "./foldy-section.scss"

interface Props {
  label: string
  secondaryLabel?: string
  icon?: JSX.Element
}

const FoldySection: FC<Props> = ({ label, icon, secondaryLabel, children }) => {
  const [isOpen, setOpen] = useState(true)
  const chevronClassNames = cx("foldy-chevron", { "is-open": isOpen })
  const processedLabel = process(label, { useDisplayName: true })
  return (
    <div className="foldy-section">
      <div className="foldy-header" onClick={() => setOpen(!isOpen)}>
        <div className="foldy-header-left">
          {icon && <div className="foldy-icon">{icon}</div>}
          <div className="foldy-label" title={processedLabel}>
            {processedLabel}
          </div>
          {secondaryLabel && (
            <div className="foldy-secondary-label" title={secondaryLabel}>
              {secondaryLabel}
            </div>
          )}
        </div>
        <div className="foldy-header-right">
          <div className={chevronClassNames}>
            <LeftArrowIcon />
          </div>
        </div>
      </div>
      {isOpen && <div className="foldy-body">{children}</div>}
    </div>
  )
}

export default FoldySection
