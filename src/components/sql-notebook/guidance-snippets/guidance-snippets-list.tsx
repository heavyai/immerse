// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useMemo, useState } from "react"
import moment from "moment"
import { useDispatch } from "react-redux"
import pushid from "pushid"
import { CircularProgress } from "@material-ui/core"

import { useGuidanceSnippets } from "../redux/useGuidanceSnippets"
import {
  GuidanceSnippet,
  GuidanceSnippetSortOptionKey,
  GuidanceSnippetWithMoment,
  SortDirectionOption
} from "../types"
import { GuidanceSnippetsListItem } from "./guidance-snippets-list-item"
import { GuidanceSnippetsListEmpty } from "./guidance-snippets-list-empty"
import { MultiSelectDropdown } from "../components/multi-select-menu"
import { BUTTON_TYPES, Button } from "../components/button"
import IconTrash from "components/svg-icons/icon-trash"
import {
  sqlNotebookDeleteGuidanceSnippets,
  sqlNotebookUndoDeletedGuidanceSnippets,
  sqlNotebookGetGuidanceSnippets,
  sqlNotebookFinalizeDeletedGuidanceSnippets
} from "../redux/sql-notebook-action-creators"
import { sqlNotebookQueue } from "../snackbar-queue"
import "./guidance-snippets-list.scss"

const SORT_OPTIONS = [
  {
    order: SortDirectionOption.ASC,
    property: "updated_at",
    label: "Oldest",
    key: GuidanceSnippetSortOptionKey.OLDEST
  },
  {
    order: SortDirectionOption.DESC,
    property: "updated_at",
    label: "Newest",
    key: GuidanceSnippetSortOptionKey.NEWEST
  }
] as {
  order: SortDirectionOption
  property: keyof GuidanceSnippet
  label: string
  key: GuidanceSnippetSortOptionKey
}[]

const UNDO_ACTION = "undo"

const sortGuidanceSnippets = (
  sortOption: GuidanceSnippetSortOptionKey,
  a: GuidanceSnippetWithMoment,
  b: GuidanceSnippetWithMoment
) => {
  const option = SORT_OPTIONS.find((o) => o.key === sortOption)
  if (!option) {
    return 0
  }

  const { property, order } = option

  if (typeof a[property] === "string") {
    return a[property].localeCompare(b[property])
  }

  if (moment.isMoment(a) && moment.isMoment(b)) {
    return a.valueOf() - b.valueOf()
  }

  return order === SortDirectionOption.ASC
    ? a[property] - b[property]
    : b[property] - a[property]
}

export const GuidanceSnippetsList = ({
  searchValue,
  onEdit
}: {
  searchValue: string
  onEdit: (snippet: GuidanceSnippet) => void
}) => {
  const dispatch = useDispatch()
  const [sortBy, setSortBy] = useState(GuidanceSnippetSortOptionKey.NEWEST)
  const guidanceSnippets = useGuidanceSnippets()

  const [selectedSnippets, setSelectedSnippets] = useState<Array<string>>([])

  const onSelectItem = useCallback(
    (id: string) => {
      if (selectedSnippets.includes(id)) {
        setSelectedSnippets(selectedSnippets.filter((sid) => sid !== id))
      } else {
        setSelectedSnippets([...selectedSnippets, id])
      }
    },
    [selectedSnippets]
  )

  const guidanceSnippetsWithDates = useMemo(
    () =>
      guidanceSnippets.snippets?.map((snippet) => ({
        ...snippet,
        created_at: moment.utc(snippet.created_at),
        updated_at: moment.utc(snippet.updated_at)
      })),
    [guidanceSnippets]
  )

  useEffect(() => {
    if (
      guidanceSnippets.snippets === null &&
      !guidanceSnippets.loading &&
      !guidanceSnippets.getGuidanceSnippetsError
    ) {
      dispatch(sqlNotebookGetGuidanceSnippets())
    }
  }, [
    dispatch,
    guidanceSnippets.getGuidanceSnippetsError,
    guidanceSnippets.loading,
    guidanceSnippets.snippets
  ])

  const sortedFilteredSnippets = useMemo(
    () =>
      guidanceSnippetsWithDates
        ?.filter(({ snippet }) =>
          snippet.toLowerCase().includes(searchValue.toLowerCase())
        )
        .sort((a, b) => sortGuidanceSnippets(sortBy, a, b))
        .map((guidanceSnippet) => (
          <GuidanceSnippetsListItem
            guidanceSnippet={guidanceSnippet}
            key={guidanceSnippet.snippet_id}
            selected={selectedSnippets.includes(guidanceSnippet.snippet_id)}
            onSelect={() => onSelectItem(guidanceSnippet.snippet_id)}
            onClick={() => onEdit(guidanceSnippet)}
          />
        )),
    [
      guidanceSnippetsWithDates,
      onEdit,
      onSelectItem,
      searchValue,
      selectedSnippets,
      sortBy
    ]
  )

  // Prevent flashing empty state before initial fetch
  if (!guidanceSnippets.snippets) {
    return null
  }

  return (
    <div className="guidance-snippets-list-container">
      {guidanceSnippets.loading && (
        <div className="guidance-snippets-list-overlay">
          <CircularProgress />
        </div>
      )}
      {selectedSnippets.length ? (
        <div className="guidance-snippets-bulk-actions">
          <Button
            type={BUTTON_TYPES.ERROR}
            label="Delete"
            icon={<IconTrash />}
            onClick={() => {
              const requestId = pushid()
              dispatch(
                sqlNotebookDeleteGuidanceSnippets(selectedSnippets, requestId)
              )
              // Display this immediately; dismiss any other snackbars
              sqlNotebookQueue.messages.array.forEach((m) => {
                if (typeof m.onClose === "function") {
                  m.onClose()
                }
              })
              sqlNotebookQueue.messages.array = []
              sqlNotebookQueue.notify({
                body:
                  selectedSnippets.length > 1
                    ? `${selectedSnippets.length} Guidance Snippets deleted`
                    : "Guidance snippet deleted",

                dismissesOnAction: true,
                dismissIcon: "close",
                onClose: (e) => {
                  const reason = e?.detail?.reason
                  if (reason === UNDO_ACTION) {
                    dispatch(sqlNotebookUndoDeletedGuidanceSnippets(requestId))
                  } else {
                    dispatch(
                      sqlNotebookFinalizeDeletedGuidanceSnippets(requestId)
                    )
                  }
                },
                actions: [{ label: "Undo", action: UNDO_ACTION }]
              })
              setSelectedSnippets([])
            }}
          />
        </div>
      ) : (
        <div className="guidance-snippets-sort">
          <div>Sort by:</div>
          <MultiSelectDropdown
            multi={false}
            options={SORT_OPTIONS.map((o) => ({
              value: o.key,
              label: o.label
            }))}
            selectedOptions={[sortBy]}
            onSelectOption={(option) =>
              setSortBy(option as GuidanceSnippetSortOptionKey)
            }
            hasSelectedOptions={() => false}
          />
        </div>
      )}
      {guidanceSnippets.snippets?.length ? (
        <div className="guidance-snippets-list">{sortedFilteredSnippets}</div>
      ) : (
        <GuidanceSnippetsListEmpty />
      )}
    </div>
  )
}
