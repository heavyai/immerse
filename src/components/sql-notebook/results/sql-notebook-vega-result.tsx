// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ResultsLoadingSpinner } from "./results-loading-spinner"
import { ResultSqlCell } from "../types"

import "./sql-notebook-vega-result.scss"

export const SqlNotebookVegaResult = ({ cell }: { cell: ResultSqlCell }) => (
  <div className="sql-notebook-vega-result">
    {cell.loading && <ResultsLoadingSpinner hasData={Boolean(cell.results)} />}
    {cell.results?.image && (
      <div className="sql-notebook-vega-result__image-backdrop">
        <img
          src={`data:image/gif;base64,${cell.results.image}`}
          alt="Vega result"
        />
      </div>
    )}
    {!cell.loading && !cell.results?.image && "No image result"}
  </div>
)
