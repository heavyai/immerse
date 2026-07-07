// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { useSelector } from "react-redux"
import cx from "classnames"
import { TextField } from "@rmwc/textfield"
import { Tooltip } from "@rmwc/tooltip"
import { AppState } from "vega/charts/types"
import { Checkbox } from "../components/checkbox"
import { BUTTON_TYPES, Button, ButtonGroup } from "../components/button"
import "./sql-notebook-source-selector.scss"

// Dialog that allows selecting sources, up to a maximum of {maxSources}
export const SqlNotebookSourceSelector = ({
  submitSources,
  initialSources,
  cancelChanges,
  maxSources = 3
}: {
  submitSources: (sources: Set<string>) => void
  initialSources?: Set<string>
  cancelChanges: () => void
  maxSources?: number
}) => {
  const tableData = useSelector((state: AppState) => state.tablesReference.list)

  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    initialSources || new Set()
  )

  const [searchValue, setSearchValue] = useState("")

  const toggleSourceSelected = (source: string, checked: boolean) => {
    const newSet = new Set(selectedSources)
    if (checked) {
      newSet.add(source)
    } else {
      newSet.delete(source)
    }
    setSelectedSources(newSet)
  }

  return (
    <SimpleDialog
      open
      className="sql-notebook__source-selector"
      hideCloseIcon
      footer={
        <>
          <div>Select up to {maxSources} sources</div>
          <ButtonGroup>
            <Button onClick={cancelChanges} outlined label={"Cancel"} />
            <Button
              type={BUTTON_TYPES.SECONDARY}
              onClick={() => submitSources(selectedSources)}
              label={"Add Sources"}
              className="notebook-primary"
            />
          </ButtonGroup>
        </>
      }
    >
      <header>
        <TextField
          icon="search"
          placeholder="Search tables"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </header>
      <div className="source-selector__list">
        {tableData
          .filter((source) =>
            source.name.toLowerCase().includes(searchValue.toLowerCase())
          )
          .map((source) => {
            const checked = selectedSources.has(source.name)
            const disabled = !checked && selectedSources.size >= maxSources
            return (
              <Tooltip content={source.name} enterDelay={500} key={source.name}>
                <div
                  className={cx("source-selector__list__item", {
                    "source-selector__list__item--selected": checked,
                    "source-selector__list__item--disabled": disabled
                  })}
                  onMouseUp={() => {
                    if (!disabled) {
                      toggleSourceSelected(source.name, !checked)
                    }
                  }}
                >
                  <Checkbox
                    label={source.name}
                    value={source.name}
                    disabled={disabled}
                    checked={checked}
                  />
                </div>
              </Tooltip>
            )
          })}
      </div>
    </SimpleDialog>
  )
}
