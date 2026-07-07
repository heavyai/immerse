// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { sqlNotebookAddInputAnalysisCell } from "components/sql-notebook/redux/sql-notebook-action-creators"

import "./splash-card.scss"

export interface ISplashCard {
  icon?: JSX.Element
  text: String
  dataSources: Array<String>
}
export const SplashCard = ({ icon, text, dataSources }: ISplashCard) => {
  const dispatch = useDispatch()
  const selectCard = () => {
    dispatch(sqlNotebookAddInputAnalysisCell(text, dataSources))
  }
  return (
    <div className="sql-notebook__splash-card" onClick={selectCard}>
      {icon && <div className="splash-card-icon">{icon}</div>}
      <div className="splash-card-text">
        <div className="splash-card-title">{text}</div>
        <div className="splash-card-datasources">{dataSources?.join(", ")}</div>
      </div>
    </div>
  )
}
