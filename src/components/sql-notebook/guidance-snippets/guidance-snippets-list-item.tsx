// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import "moment-timezone"

import { Checkbox } from "../components/checkbox"
import cx from "classnames"
import { GuidanceSnippetWithMoment } from "../types"
import { GuidanceSnippetTimestamp } from "./guidance-snippet-timestamp"
import { useIsGuidanceSnippetEditor } from "../hooks/useIsGuidanceSnippetEditor"
import "./guidance-snippets-list-item.scss"

export const GuidanceSnippetsListItem = ({
  guidanceSnippet: { updated_at, snippet },
  selected,
  onSelect,
  onClick
}: {
  guidanceSnippet: GuidanceSnippetWithMoment
  selected: boolean
  onSelect: (c: boolean) => void
  onClick: () => void
}) => {
  const isEditor = useIsGuidanceSnippetEditor()
  return (
    <div
      className={cx(
        {
          "guidance-snippets-list-item--selected": selected
        },
        "guidance-snippets-list-item"
      )}
      onClick={onClick}
    >
      {isEditor && (
        <div className="guidance-snippets-list-item__controls">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(e.currentTarget.checked)}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
        </div>
      )}
      <div className="guidance-snippets-list-item__content">
        <p>{snippet}</p>
        <GuidanceSnippetTimestamp timestamp={updated_at} />
      </div>
    </div>
  )
}
