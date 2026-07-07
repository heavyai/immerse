// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"

import { useColumnOptions } from "hooks/use-column-options"
import { makeSelectGroupedOptions } from "selectors/data-sources"

import { MultiSelect } from "widgets/multi-select/Multi-select"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import IconSourceLink from "components/svg-icons/icon-sourcelink"

import { CrossLink, ColumnMap } from "constants/crosslink-types"
import { isOrdinal } from "constants/data-types"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { useSelector } from "react-redux"
import { getFullColumnName } from "components/join-manager/utils"
import { components, OptionProps } from "react-select"
import { Column } from "vega/constants/data-selection-types"

import "./EditCrossLink.scss"

export type NewColumnMap = Partial<ColumnMap>
export type NewColumnMaps = NewColumnMap[]
export type NewCrossLink = Omit<Partial<CrossLink>, "columnLinks"> & {
  columnLinks?: NewColumnMaps
}

type Props = {
  crossLink: NewCrossLink
  dataSources: string[]
  saveCrossLink(crosslink: NewCrossLink): void
  cancelEdit(): void
}

function cohortFlag(colA, colB): boolean {
  return (colA && isOrdinal(colA.type)) || (colB && isOrdinal(colB.type))
}

const OptionWithTooltip = (props: OptionProps) => {
  return (
    <div title={props.data.value}>
      <components.Option {...props} />
    </div>
  )
}
const EditCrossLink: FC<Props> = ({
  crossLink = {},
  dataSources = [],
  saveCrossLink,
  cancelEdit
}) => {
  const [sourceA, setSourceA] = useState(crossLink.sourceA)
  const [sourceB, setSourceB] = useState(crossLink.sourceB)

  const joinDataSources = useSelector((state) => state.joinDataSources)
  const joinDataSourceA = useJoinFromParameter(sourceA)
  const joinDataSourceB = useJoinFromParameter(sourceB)

  const sourceADisplay = joinDataSourceA?.name ?? sourceA
  const sourceBDisplay = joinDataSourceB?.name ?? sourceB

  const [columnLinks, setColumnLinks] = useState<NewColumnMaps>(
    crossLink.columnLinks || [{}]
  )

  const columnOptionsA = useColumnOptions(sourceA, { includeCustom: true })
  const columnOptionsB = useColumnOptions(sourceB, { includeCustom: true })

  useEffect(() => {
    setSourceA(crossLink.sourceA)
  }, [crossLink.sourceA])

  useEffect(() => {
    setSourceB(crossLink.sourceB)
  }, [crossLink.sourceB])

  useEffect(() => {
    setColumnLinks(crossLink.columnLinks || [{}])
  }, [crossLink.columnLinks])

  // This allows displaying the currently selected option before we've fetched the full options list.
  // (And prevents the accompanying jarring selection animation when said fetch returns.)
  const selectOptions = dataSources.length
    ? makeSelectGroupedOptions(dataSources, joinDataSources)
    : sourceA
    ? [sourceA]
    : []

  const shouldDisableSave = !(
    sourceA &&
    sourceB &&
    columnLinks.some((columnLink) => columnLink.columnA && columnLink.columnB)
  )

  return (
    <form className="crosslink-edit">
      <fieldset>
        <MultiSelect
          blurInputOnSelect
          className="crosslink-source__a"
          hasError={false}
          placeholder="Source A"
          options={selectOptions}
          value={
            sourceA
              ? {
                  label: sourceADisplay,
                  value: sourceA
                }
              : "Source A"
          }
          onChange={(option) => {
            setSourceA(option.value)
            // Clear old column selections if source is changed to prevent
            // source column mismatches
            setColumnLinks((links) =>
              links.map((link) => ({
                ...link,
                columnA: ""
              }))
            )
          }}
        />

        <span className="crosslink-edit__link-icon">
          <IconSourceLink />
        </span>

        <MultiSelect
          blurInputOnSelect
          className="crosslink-source__b"
          hasError={false}
          placeholder="Source B"
          options={selectOptions}
          value={
            sourceB
              ? {
                  label: sourceBDisplay,
                  value: sourceB
                }
              : "Source B"
          }
          onChange={(option) => {
            setSourceB(option.value)
            // Clear old column selections if source is changed to prevent
            // source column mismatches
            setColumnLinks((links) =>
              links.map((link) => ({
                ...link,
                columnB: ""
              }))
            )
          }}
        />
      </fieldset>

      {columnLinks.map((columnLink, index) => (
        <fieldset
          key={`crosslink-edit-${
            crossLink.id || "pending"
          }-columnlink-${index}`}
        >
          <MultiSelect
            blurInputOnSelect
            hasError={false}
            isDisabled={!sourceA}
            placeholder="Column A"
            options={columnOptionsA.map((column: Column) => ({
              label: column.value,
              value: getFullColumnName(column)
            }))}
            value={
              columnLink.columnA
                ? {
                    label: columnLink.columnA,
                    value: columnLink.columnA
                  }
                : "Column A"
            }
            onChange={(option) => {
              setColumnLinks((links) => {
                const newColumnLinks = [...links]
                newColumnLinks[index] = {
                  ...columnLinks[index],
                  columnA: option.value,
                  cohort: cohortFlag(
                    columnOptionsA.find(({ value }) => value === option.value),
                    columnOptionsB.find(
                      ({ value }) => value === columnLinks[index].columnB
                    )
                  )
                }
                return newColumnLinks
              })
            }}
            components={{
              Option: OptionWithTooltip
            }}
          />

          <span className="crosslink-edit__column-operator">=</span>

          <MultiSelect
            blurInputOnSelect
            hasError={false}
            isDisabled={!sourceB}
            placeholder="Column B"
            options={columnOptionsB.map((column: Column) => ({
              label: column.value,
              value: getFullColumnName(column)
            }))}
            value={
              columnLink.columnB
                ? {
                    label: columnLink.columnB,
                    value: columnLink.columnB
                  }
                : "Column B"
            }
            onChange={(option) => {
              setColumnLinks((links) => {
                const newColumnLinks = [...links]
                newColumnLinks[index] = {
                  ...columnLinks[index],
                  columnB: option.value,
                  cohort: cohortFlag(
                    columnOptionsA.find(
                      ({ value }) => value === columnLinks[index].columnA
                    ),
                    columnOptionsB.find(({ value }) => value === option.value)
                  )
                }
                return newColumnLinks
              })
            }}
            components={{
              Option: OptionWithTooltip
            }}
          />
        </fieldset>
      ))}

      <div
        className="crosslink-edit__add-columns"
        onClick={() => setColumnLinks((links) => [...links, {}])}
      >
        + Add column match
      </div>

      <footer>
        <SecondaryButton
          onClick={(e) => {
            e.preventDefault()
            cancelEdit()

            // Reset values
            setSourceA(crossLink.sourceA)
            setSourceB(crossLink.sourceB)
            setColumnLinks(crossLink.columnLinks || [{}])
          }}
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          disabled={shouldDisableSave}
          onClick={(e) => {
            e.preventDefault()
            saveCrossLink({
              id: crossLink.id,
              sourceA,
              sourceB,
              columnLinks
            })
          }}
        >
          Save
        </PrimaryButton>
      </footer>
    </form>
  )
}

export default EditCrossLink
