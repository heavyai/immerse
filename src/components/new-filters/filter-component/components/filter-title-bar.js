// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import ReactTestUtils from "react-dom/test-utils"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { Switch } from "widgets/switch/Switch"
import { Tooltip } from "@rmwc/tooltip"
import "@rmwc/tooltip/tooltip.css"
import "@rmwc/icon/icon.css"

export default function FilterTitleBar({
  displayName,
  enabled,
  simpleModeEnabled,
  incomplete,
  onClick,
  onClickToggle,
  onClickSimpleModeIcon,
  showSimpleModeIcon,
  dataTableRef,
  classNames,
  toggleTestId,
  testId,
  setColumnSearchText,
  editingColumn,
  columnSearchText,
  hideAdvancedFilterControls
}) {
  const onClickToggleNotPropagated = (e) => {
    e.stopPropagation()

    // Interacting with the Switch component lags significantly
    // without this setTimeout #whenindoubt
    setTimeout(onClickToggle, 0)
  }

  const handleInputKeyDown = (e) => {
    // This is some black magic to trigger DataTable's keydown when a user
    // keys down in the search input. This is the result of DataTable being
    // separate from the search field.
    //
    // See this stackoverflow for why we're using ReactTestUtils.Simulate instead
    // of the native `dispatchEvent(new KeyboardEvent("keydown"))`
    // https://stackoverflow.com/questions/39065010/why-react-event-handler-is-not-called-on-dispatchevent
    ReactTestUtils.Simulate.keyDown(dataTableRef.current, {
      keyCode: e.keyCode
    })
  }

  const renderSearchField = () => {
    return (
      <input
        type="text"
        value={columnSearchText}
        onChange={(e) => setColumnSearchText(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={displayName || "Select a column"}
        autoFocus
      />
    )
  }

  const showAdvancedFilterControls = !hideAdvancedFilterControls

  // If the title bar has a displayName, we can assume that the user has either
  // chosen a column name or the filter is a cohort or custom SQL filter.
  //
  // Without a column name, we are unable to show the filter in Simple Mode,
  // because the ability to edit a column name is also disabled in Simple Mode
  const shouldDisableSimpleModeIcon = !displayName
  let simpleModeTooltip = `${
    simpleModeEnabled ? "Hide" : "Show"
  } this filter in Simple Mode`
  if (shouldDisableSimpleModeIcon) {
    simpleModeTooltip = "Select a column to enable Simple Mode"
  }

  return (
    <div
      className={`filter-component-column ${classNames}`}
      onClick={() => {
        if (showAdvancedFilterControls) {
          onClick()
        }
      }}
    >
      {onClickToggle && (
        <div
          className={cx("filter-component-toggle", {
            incomplete
          })}
        >
          {incomplete ? (
            <Icon icon="edit" className="incomplete-icon" />
          ) : (
            <Switch
              checked={enabled}
              disabled={incomplete}
              onClick={onClickToggleNotPropagated}
              data-testid={toggleTestId || "filter-component-toggle"}
            />
          )}
        </div>
      )}
      <span
        className="data-expression"
        data-testid={testId || "filter-component-data-expression"}
        title={displayName}
      >
        {editingColumn && showAdvancedFilterControls
          ? renderSearchField()
          : displayName || ""}
      </span>
      {showSimpleModeIcon && showAdvancedFilterControls && (
        <Tooltip content={simpleModeTooltip} enterDelay={500}>
          <Icon
            data-testid="filter-component-simple-mode-toggle"
            className={cx("filter-component-simple-mode-icon", {
              "is-disabled": shouldDisableSimpleModeIcon
            })}
            icon={{
              icon: simpleModeEnabled ? "star" : "star_outline",
              size: "xsmall"
            }}
            onClick={(e) => {
              if (!shouldDisableSimpleModeIcon) {
                e.stopPropagation()
                onClickSimpleModeIcon()
              }
            }}
          />
        </Tooltip>
      )}
    </div>
  )
}

FilterTitleBar.propTypes = {
  onClick: PropTypes.func,
  onClickRemove: PropTypes.func,
  displayName: PropTypes.string,
  incomplete: PropTypes.bool,
  enabled: PropTypes.bool,
  classNames: PropTypes.string,
  onClickToggle: PropTypes.func,
  showSimpleModeIcon: PropTypes.bool,
  simpleModeEnabled: PropTypes.bool,
  onClickSimpleModeIcon: PropTypes.func,
  removeFilter: PropTypes.func,
  showRemoveIcon: PropTypes.bool,
  toggleTestId: PropTypes.string,
  testId: PropTypes.string,
  editingColumn: PropTypes.bool,
  setColumnSearchText: PropTypes.func,
  columnSearchText: PropTypes.string
}
