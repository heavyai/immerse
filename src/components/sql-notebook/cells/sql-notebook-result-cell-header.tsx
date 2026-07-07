// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { CellTitle } from "./sql-notebook-cell-title"
import { FeedbackButtons } from "../components/feedback-buttons"
import { ResultAnalysisCell } from "../types"

import "./sql-notebook-result-cell-header.scss"

export const ResultCellHeader = ({ cell }: { cell: ResultAnalysisCell }) => {
  const { feedbackId } = cell
  return (
    <div className="sql-notebook-header">
      <section className="sql-notebook-header-section">
        <CellTitle cell={cell} />
      </section>
      <section className="sql-notebook-header-section">
        {feedbackId && <FeedbackButtons feedbackId={feedbackId} />}
      </section>
    </div>
  )
}
