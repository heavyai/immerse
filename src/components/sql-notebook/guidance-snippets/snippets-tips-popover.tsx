// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { IconLightbulb } from "components/svg-icons/icon-lightbulb"
import { IconOpenBook } from "components/svg-icons/icon-open-book"
import { IconRuler } from "components/svg-icons/icon-ruler"

import "./snippet-tips-popover.scss"

export const SnippetTipsPopover = () => {
  return (
    <div className="snippet-tips-popover__content">
      <h3>TIPS FOR USING SNIPPETS</h3>
      <div className="snippet-tips-popover__usage-tips-list">
        <div className="snippet-tips-popover__usage-tip">
          <div className="snippet-tips-popover__usage-tip-header">
            <IconLightbulb className="yellow" />
            <h3>Hints</h3>
          </div>
          <p>
            Can be used to suggest a particular column or ways to approach a
            type of question.
          </p>
        </div>
        <div className="snippet-tips-popover__usage-tip">
          <div className="snippet-tips-popover__usage-tip-header">
            <IconOpenBook className="snippet-tips-popover__icon-clock green" />
            <h3>Definitions, KPIs, and Acronyms</h3>
          </div>
          <p>
            Define domain specific terms, formulas to compute metrics, and
            acronyms and aliases.
          </p>
        </div>
        <div className="snippet-tips-popover__usage-tip">
          <div className="snippet-tips-popover__usage-tip-header">
            <IconRuler className="blue" />
            <h3>Facts</h3>
          </div>
          <p>
            Provide specific information (dates, conversion formulas, etc) that
            will help the model generate accurate answers.
          </p>
        </div>
      </div>
    </div>
  )
}
