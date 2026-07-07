// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useCallback, useEffect, useState } from "react"
import { connect, useDispatch } from "react-redux"
import pushid from "pushid"

import { sortedDataSourcesSelector } from "selectors/data-sources"
import { getDataSourcesList } from "actions/tables-action-creators"
import * as actions from "actions/crosslink-action-creators"
import { updateDashboardSaveState } from "actions/dashboard-save-state-action-creators"
import { CrossLink, ColumnMap } from "constants/crosslink-types"

import { SecondaryButton } from "widgets/button/Button"
import EditCrossLink, {
  NewCrossLink
} from "components/crosslink-panel/EditCrossLink"
import CrossLinkInfo from "components/crosslink-panel/CrossLinkInfo"

import "./CrossLinkPanel.scss"

const NEW_CROSSLINK_ID = "~new~"

type Props = {
  crossLinks: CrossLink[]
  dataSources: string[]
  isLoadingDataSources: boolean
}

const mapStateToProps = (state) => ({
  dataSources: sortedDataSourcesSelector(
    state.dashboard.dataSources,
    state.tables.list
  ),
  isLoadingDataSources: state.tables.loading,
  crossLinks: state.crossLinks
})

const CrossLinkPanel: FC<Props> = ({
  crossLinks,
  dataSources,
  isLoadingDataSources
}) => {
  const dispatch = useDispatch()
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null)

  const saveCrossLink = useCallback(
    (link: NewCrossLink) => {
      if (link.sourceA && link.sourceB) {
        const crossLink: CrossLink = {
          id: link.id || pushid(),
          enabled: true,
          sourceA: link.sourceA,
          sourceB: link.sourceB,
          columnLinks: (
            link.columnLinks || []
          ).filter((col): col is ColumnMap =>
            Boolean(col.columnA && col.columnB)
          )
        }
        if (crossLink.columnLinks.length > 0) {
          dispatch(actions.saveCrossLink(crossLink))
          dispatch(updateDashboardSaveState(true))
        }
      }
      setCurrentEditingId(null)
    },
    [dispatch]
  )

  const toggleCrossLink = useCallback(
    (id: CrossLink["id"]) => {
      dispatch(actions.toggleCrossLink(id))
      dispatch(updateDashboardSaveState())
    },
    [dispatch]
  )

  const deleteCrossLink = useCallback(
    (id: CrossLink["id"]) => {
      dispatch(actions.deleteCrossLink(id))
      dispatch(updateDashboardSaveState(true))
    },
    [dispatch]
  )

  useEffect(() => {
    if (
      dataSources.every((dataSourceGroup) => !dataSourceGroup.length) &&
      !isLoadingDataSources
    ) {
      dispatch(getDataSourcesList())
    }
  }, [dispatch, dataSources, isLoadingDataSources])

  return (
    <div className={"crosslink-panel dashboard-config-panel"}>
      <header className={"crosslink-panel__header"}>
        <h5>Cross-linking</h5>
      </header>

      <div className={"crosslink-panel__content"}>
        <SecondaryButton
          disabled={currentEditingId}
          onClick={() => setCurrentEditingId(NEW_CROSSLINK_ID)}
        >
          Setup cross-link
        </SecondaryButton>

        {currentEditingId === NEW_CROSSLINK_ID && (
          <EditCrossLink
            crossLink={{}}
            dataSources={dataSources}
            cancelEdit={() => setCurrentEditingId(null)}
            saveCrossLink={saveCrossLink}
          />
        )}

        {crossLinks.map((crossLink) =>
          currentEditingId === crossLink.id ? (
            <EditCrossLink
              key={`crosslink-edit-${crossLink.id}`}
              crossLink={crossLink}
              dataSources={dataSources}
              cancelEdit={() => setCurrentEditingId(null)}
              saveCrossLink={saveCrossLink}
            />
          ) : (
            <CrossLinkInfo
              key={`crosslink-${crossLink.id}`}
              crossLink={crossLink}
              isDisabled={currentEditingId && currentEditingId !== crossLink.id}
              editCrossLink={() => setCurrentEditingId(crossLink.id)}
              toggleCrossLink={() => toggleCrossLink(crossLink.id)}
              deleteCrossLink={() => deleteCrossLink(crossLink.id)}
            />
          )
        )}
      </div>
    </div>
  )
}

export default connect(mapStateToProps)(CrossLinkPanel)
