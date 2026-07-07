// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { QUERY_GENERATOR_COMPLEXITY_TEXT } from "constants/text"
import IconComplexity from "components/svg-icons/icon-complexity"
import { Tooltip } from "@rmwc/tooltip"

import "./styles.scss"

const getAccuracyLevel = (complexity: number) => {
  switch (complexity) {
    case 1:
    case 2:
      return "high"
    case 3:
      return "moderate"
    default:
      return "reduced"
  }
}

const QUERY_COMPLEXITY_ID = "sql-generator-query-complexity"

const SqlEditorQueryGeneratorComplexity = ({
  complexity
}: {
  complexity: 1 | 2 | 3 | 4 | 5
}) => {
  const accuracyLevel = getAccuracyLevel(complexity)
  const complexityStr = complexity.toString() as keyof typeof QUERY_GENERATOR_COMPLEXITY_TEXT
  const complexityDescription = QUERY_GENERATOR_COMPLEXITY_TEXT[complexityStr]

  const tooltip = (
    <div className="query-complexity__tooltip">
      <div className="query-complexity__tooltip__heading">
        <div>
          <h6>Complexity</h6>
          <h2>{`Level ${complexity}`}</h2>
        </div>
        <div
          className={`query-complexity__tooltip__accuracy-level query-complexity__tooltip__accuracy-level--${accuracyLevel}`}
        >
          <span>Accuracy</span>
          <span>{accuracyLevel}</span>
        </div>
      </div>
      <p>{complexityDescription}</p>
    </div>
  )
  return (
    <Tooltip
      content={tooltip}
      align="topRight"
      className="query-complexity__tooltip-wrapper"
    >
      <div id={QUERY_COMPLEXITY_ID}>
        <div className="query-complexity__label">
          <IconComplexity className="query-complexity__label__icon" />
          <span>Complexity</span>
        </div>
        <div className="query-complexity__rating">{complexity}</div>
      </div>
    </Tooltip>
  )
}

export default SqlEditorQueryGeneratorComplexity
