// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import pushid from "pushid"
import { CircularProgress } from "@rmwc/circular-progress"
import { IconButton } from "widgets/icon-button/Icon-button"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import AutocompleteParent from "components/autocomplete/autocomplete-parent"
import { ParameterTypes } from "components/parameters/parameters-types"
import { JoinDataSourceItem } from "components/join-manager/join-data-source-item"

import "./styles.scss"
import { openJoinManager } from "components/join-manager/join-manager-actions"
import { useDispatch } from "react-redux"
import IconBeta from "components/svg-icons/icon-beta"
import useEnableJoins from "hooks/useEnableJoins"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

export type DataSourceSelectorEvent = {
  value: string // Table name
}

export type SpecificDataSourceSelectorEventHandler = (
  event: DataSourceSelectorEvent,
  layerId: string
) => void

export type DataSourceSelectorEventHandler = (
  event: DataSourceSelectorEvent
) => void

type Actions = {
  // Legacy action to interact with the chart table preview overlay
  // and AutocompleteParent's logic around it.
  initChartEditorTablePreview: (table: string | null) => void
}

type Props = {
  sortedTableOptions: TableOption[]

  // The currently selected table
  selectedTable?: string

  // Event listener fired when the user selects a new table
  onChange: (tableName: string) => void

  // Event listener fired when the user clears the selection
  onClear: () => void

  actions: Actions

  // Fetches tables. This will either fetch the tables list, or, if we need to
  // filter the options by metadata, the full tables metadata.
  fetchSources: () => void

  disabled: boolean
  chartId: string
  layerId: string
  disabledTooltip: string
}

// Option objects for AutocompleteParent
export type TableOption = {
  value: string
  label: string
}

export type ExtendedOption = TableOption & {
  name?: string
  type?: string
  parameter?: string
}

export enum SourceSelectorOptionKeys {
  // These pushids might be overkill. We basically just want to protect against
  // the possibility of a user having the same table name as our "special" options
  BREAK = `BREAK-${pushid()}`,
  CUSTOM = `CUSTOM-${pushid()}`,
  JOIN = `JOIN-${pushid()}`
}

export const renderSourceSelectorOption = (tableOption: ExtendedOption) => {
  const { value, type } = tableOption

  // Handles special menu items like the line break, custom source, and join modal triggers
  switch (value) {
    case SourceSelectorOptionKeys.BREAK:
      return (
        <div className="autocomplete-dropdown-item-content section-break" />
      )
    case SourceSelectorOptionKeys.CUSTOM:
      return (
        <div className="autocomplete-dropdown-item-content">
          <div className="link">+ Create Custom Source</div>
        </div>
      )
    case SourceSelectorOptionKeys.JOIN:
      return (
        <div className="autocomplete-dropdown-item-content">
          <div className="link">+ Create New Join</div>
          <div className="link-badge">
            <IconBeta />
          </div>
        </div>
      )
    default:
      break
  }

  // Handles different types of data sources
  switch (type) {
    case ParameterTypes.JOIN:
      return <JoinDataSourceItem item={tableOption} />
    default:
      return (
        <div className="autocomplete-dropdown-item-content">
          <div className="value">{value}</div>
        </div>
      )
  }
}

const BaseSourceSelector: FC<Props> = ({
  chartId,
  layerId,
  sortedTableOptions,
  selectedTable,
  onChange,
  onClear,
  actions,
  fetchSources,
  disabled = false,
  disabledTooltip
}) => {
  const dispatch = useDispatch()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  const openDropdown = () => {
    setDropdownOpen(true)
  }

  const closeDropdown = () => {
    setDropdownOpen(false)
  }

  // These event handlers are all to manage the table preview overlay /
  // AutocompleteParent interactions
  const handleAutocompleteTableHover: DataSourceSelectorEventHandler = (
    event
  ) => {
    if (!Object.values(SourceSelectorOptionKeys).includes(event.value)) {
      actions.initChartEditorTablePreview(event.value)
    }
  }

  const handleAutocompleteMouseLeave = () => {
    actions.initChartEditorTablePreview(null)
  }

  const handleAutocompleteExit = () => {
    actions.initChartEditorTablePreview(null)
    closeDropdown()
  }

  const handleUpdateValue: DataSourceSelectorEventHandler = (event) => {
    actions.initChartEditorTablePreview(null)
    closeDropdown()
    if (event.value === SourceSelectorOptionKeys.CUSTOM) {
      actions.openCustomSourceManager({
        activeDataSource: selectedTable,
        layerId,
        chartId
      })
    } else if (event.value === SourceSelectorOptionKeys.JOIN) {
      dispatch(
        openJoinManager({
          layerId,
          chartId
        })
      )
    } else {
      onChange(event.value)
    }
  }

  const actionOptions = []
  if (getFeatureFlag(available_feature_flags.ENABLE_CUSTOM_SOURCE_MANAGER)) {
    actionOptions.push({
      value: SourceSelectorOptionKeys.CUSTOM,
      label: SourceSelectorOptionKeys.CUSTOM
    })
  }

  const enableJoins = useEnableJoins()

  if (enableJoins) {
    actionOptions.push({
      value: SourceSelectorOptionKeys.JOIN,
      label: SourceSelectorOptionKeys.JOIN
    })
  }

  const options = actionOptions?.length
    ? [...actionOptions, ...(sortedTableOptions || [])]
    : sortedTableOptions

  const handleClear = () => {
    actions.initChartEditorTablePreview(null)
    closeDropdown()
    onClear()
  }

  if (disabled) {
    return (
      <TooltipIfContent content={disabledTooltip}>
        <div
          className="data-source-selector vega-data-source-selector"
          data-testid="base-data-source-selector"
        >
          <button
            className={"button add-source"}
            onClick={openDropdown}
            data-testid="add-source"
            disabled
          >
            {"Source"}
          </button>
        </div>
      </TooltipIfContent>
    )
  }

  return (
    <div
      className="data-source-selector vega-data-source-selector"
      data-testid="base-data-source-selector"
    >
      {/* We assume that the only reason sortedTableOptions is null is if
       *  get_tables/get_tables_meta hasn't finished
       */}
      {sortedTableOptions === null ? (
        <>
          <button
            className={"button add-source"}
            data-testid="add-source"
            disabled
          >
            {"Loading sources"}
          </button>
          <CircularProgress className="data-source-clear-button data-source-loader" />
        </>
      ) : (
        <>
          {dropdownOpen ? (
            <div className="data-source-selector-popup">
              <AutocompleteParent
                testid="data-source-autocomplete"
                className="popout-style-constant"
                forceComplete
                onEnter={handleAutocompleteTableHover}
                onExit={handleAutocompleteExit}
                onLeave={handleAutocompleteMouseLeave}
                openByDefault
                options={options}
                placeholder="Select Data Source"
                renderOption={renderSourceSelectorOption}
                selectedOption={{ value: selectedTable || "" }}
                selectInputwithoutDropdown={false}
                updateValue={handleUpdateValue}
                valueAlias="label"
              />
            </div>
          ) : selectedTable ? (
            <>
              <button
                className="button data-source-pill"
                data-testid="data-source-trigger"
                onClick={openDropdown}
              >
                <span className="data-source-pill-label">{selectedTable}</span>
              </button>
              <IconButton
                className="data-source-clear-button"
                icon="clear"
                onClick={handleClear}
                ripple={false}
              />
            </>
          ) : (
            <button
              className={"button add-source"}
              onClick={openDropdown}
              data-testid="add-source"
            >
              {"Source"}
            </button>
          )}
        </>
      )}
    </div>
  )
}
export default BaseSourceSelector
