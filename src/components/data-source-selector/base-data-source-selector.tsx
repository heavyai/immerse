// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from "react"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import AutocompleteParent from "components/autocomplete/autocomplete-parent"
import {
  renderSourceSelectorOption,
  SourceSelectorOptionKeys
} from "vega/components/SourceSelector/BaseSourceSelector"
import useEnableJoins from "hooks/useEnableJoins"

type Props = {
  dataSource: string
  getTables: () => void
  multiSourceIndex: number
  onClickOutside: () => void
  onDropdownClose: () => void
  onHidePreview: () => void
  onHoverPreview: () => void
  onSelect: () => void
  tables: any
  loadingTables: boolean
  loadedTables: boolean
}

export const BaseDataSourceSelector: FC<Props> = ({
  tables,
  getTables,
  onDropdownClose,
  dataSource,
  onClickOutside,
  multiSourceIndex,
  onSelect,
  onHoverPreview,
  onHidePreview,
  loadingTables,
  loadedTables
}) => {
  const loadTables = !loadingTables && !loadedTables

  useEffect(() => {
    if (!tables.length && loadTables) {
      getTables()
    }
  }, [getTables, loadTables, tables])

  const enableJoins = useEnableJoins()

  const [isEditing, setIsEditing] = useState(false)

  const onEditing = () => {
    setIsEditing(true)
  }

  const onStopEditing = () => {
    setIsEditing(false)
    if (typeof onDropdownClose === "function") {
      onDropdownClose()
    }
  }

  const actionOptions = useMemo(() => {
    const options = []
    if (getFeatureFlag(available_feature_flags.ENABLE_CUSTOM_SOURCE_MANAGER)) {
      options.push({
        value: SourceSelectorOptionKeys.CUSTOM,
        label: SourceSelectorOptionKeys.CUSTOM
      })
    }
    if (enableJoins) {
      options.push({
        value: SourceSelectorOptionKeys.JOIN,
        label: SourceSelectorOptionKeys.JOIN
      })
    }
    return options
  }, [enableJoins])

  const options = useMemo(() => {
    const emptyValue = loadingTables ? "loading" : "No data sources"
    return tables.length
      ? [...actionOptions, ...tables]
      : [{ label: emptyValue, value: emptyValue }]
  }, [actionOptions, loadingTables, tables])

  return (
    <div className="data-source-selector">
      {!isEditing && !dataSource && (
        <button
          className={"button add-source"}
          onClick={onEditing}
          data-testid="add-source"
        >
          {"Select Data Source"}
        </button>
      )}
      {!isEditing && dataSource && (
        <button className={"button data-source-pill"} onClick={onEditing}>
          <span
            className="data-source-pill-label"
            data-testid="data-source-pill-label"
          >
            {dataSource}
          </span>
        </button>
      )}
      {isEditing && (
        <div className="data-source-selector-popup">
          <AutocompleteParent
            testid="data-source-autocomplete"
            className={"popout-style-constant"}
            forceComplete
            multiSourceIndex={multiSourceIndex}
            onEnter={onHoverPreview}
            onExit={onStopEditing}
            onLeave={onHidePreview}
            openByDefault
            options={options}
            parentClickOutside={onClickOutside}
            placeholder={"Select Data Source"}
            renderOption={renderSourceSelectorOption}
            selectedOption={{ value: dataSource || "" }}
            selectInputwithoutDropdown={false}
            updateValue={onSelect}
            valueAlias={"label"}
          />
        </div>
      )}
    </div>
  )
}
