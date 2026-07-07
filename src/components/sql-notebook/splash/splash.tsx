// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { IconHeavyIQ } from "components/svg-icons/icon-heavy-iq"
import { ISplashCard, SplashCard } from "./splash-card"
import { IconFingerprint } from "components/svg-icons/icon-fingerprint"
import { IconBall } from "components/svg-icons/icon-ball"
import { IconLightbulb } from "components/svg-icons/icon-lightbulb"
import { IconChatEllipses } from "components/svg-icons/icon-chat-ellipses"
import { SqlEditorCTA } from "components/sql-notebook/components/sql-editor-cta"
import { sqlNotebookSetCellType } from "components/sql-notebook/redux/sql-notebook-action-creators"
import { useDispatch, useSelector } from "react-redux"
import { CellType } from "components/sql-notebook/types"

import "./splash.scss"
import { available_feature_flags } from "components/control-panel/available_feature_flags"
import { getFeatureFlag } from "components/control-panel/featureflags"
import { useCurrentDatabase } from "hooks/useCurrentDatabase"
import { AppState } from "vega/charts/types"
import { useIQEnabled } from "../hooks/useIQEnabled"
import { IconConsole } from "components/svg-icons/icon-console"
import cx from "classnames"

const availableIcons = [
  <IconLightbulb key="light" className="yellow" />,
  <IconChatEllipses key="chat" className="green" />,
  <IconBall key="ball" className="blue" />,
  <IconFingerprint key="fingerprint" className="purple" />
]
export const Splash = () => {
  const dispatch = useDispatch()
  const currentDb = useCurrentDatabase()
  const configuredCards = getFeatureFlag(
    available_feature_flags.SQL_NOTEBOOK_CARDS
  )
  const iqEnabled = useIQEnabled()

  let cardsByDatabase = null
  try {
    cardsByDatabase = JSON.parse(configuredCards)
    // eslint-disable-next-line no-empty
  } catch (e) {}
  const cards = cardsByDatabase?.[currentDb] ?? []

  const { latestCell, lastIndex } = useSelector((state: AppState) => {
    const cells = state.sqlNotebook?.cells ?? []
    if (cells.length) {
      const i = cells.length - 1
      return {
        latestCell: cells[i],
        lastIndex: i
      }
    } else {
      return {
        latestCell: null,
        lastIndex: 0
      }
    }
  })

  const iqContent = (
    <>
      <div>
        <span>Jump right into the </span>
        <SqlEditorCTA
          onClick={() => {
            // Switch to sql editor if we have an analysis input open
            if (latestCell?.type === CellType.INPUT_ANALYSIS) {
              dispatch(sqlNotebookSetCellType(lastIndex, CellType.INPUT_SQL))
            }
          }}
        />
        <span>
          . Ask HeavyIQ to assist you in writing SQL, visualizing charts, or
          analyzing SQL.
        </span>
      </div>
      <div>
        Don’t forget, HeavyIQ will auto detect if you&apos;re writing in SQL and
        change the prompt to an editor.
      </div>
    </>
  )
  const sqlNotebookContent = (
    <div>
      <span>Jump right into the </span>
      <SqlEditorCTA
        onClick={() => {
          dispatch(sqlNotebookSetCellType(lastIndex, CellType.INPUT_SQL))
        }}
      />
      <span>
        . No more data spelunking! Our table browser received a much needed
        makeover, with enhanced column previews, as well as faster and more
        robust search options.
      </span>
    </div>
  )

  return (
    <div className="sql-notebook__splash">
      <div className="splash-container">
        <div className="splash-logo splash-section">
          <div className={cx("icon-avatar", { "iq-enabled": iqEnabled })}>
            {iqEnabled ? <IconHeavyIQ /> : <IconConsole />}
          </div>
        </div>
        <div className="splash-title splash-section">
          Introducing SQL Notebook
        </div>
        <div className="splash-text splash-section">
          We&apos;ve made changes to the SQL Editor{" "}
          {iqEnabled && <span>and added a brand new AI Curator, HeavyIQ.</span>}
        </div>
        <div className="splash-subtext splash-section">
          {iqEnabled ? iqContent : sqlNotebookContent}
          {cards.length > 0 && iqEnabled && (
            <div>
              Use of this demo is subject to our{" "}
              <a href="https://www.heavy.ai/heavy-ai-terms-of-use">
                Terms of Use
              </a>
              .
            </div>
          )}
        </div>
        {iqEnabled && (
          <div className="splash-cards splash-section">
            {cards.map((card: ISplashCard, i: number) => {
              const iconIdx = i % availableIcons.length
              const cardWithIcon = { ...card, icon: availableIcons[iconIdx] }
              return <SplashCard key={i} {...cardWithIcon} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
