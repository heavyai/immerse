// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import cx from "classnames"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"

import ParameterTypeIcon from "./ParameterTypeIcon"

import {
  ParameterDefinition,
  ParameterTypes
} from "components/parameters/parameters-types"

import ColumnValueDropdown from "components/column-value-dropdown"

import ParameterWidgetInputGeneric from "./ParameterWidgetInputGeneric"
import ParameterWidgetInputNumeric from "./ParameterWidgetInputNumeric"
import ParameterWidgetColumnDropdown from "./ParameterWidgetColumnDropdown"
import ParameterWidgetMenu from "./ParameterWidgetMenu"
import ParameterWidgetLinkToggle from "./ParameterWidgetLinkToggle"

import "./parameter-widget.scss"
import { noop } from "../../utils/helpers"
import { ShowHideButton } from "./ShowHideButton"
import { NUMBER_STEP_PRECISIONS } from "../parameters/constants"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"

type Props = {
  parameter: ParameterDefinition
  columnValues: {
    [dataSource: string]: {
      [column: string]: {
        distinctValues: string[]
      }
    }
  }
  getDistinctColumnValues: () => void
  showMenu?: boolean
  value: string
  linked: boolean
  showReset: boolean
  resetValue: string
  showRemoveIcon?: boolean
  actions: {
    toggleLinked: () => void
    setValue: (value: string) => void
    resetToDefaultValue: () => void
    removeParameterFromSet: (parameterName: string) => void
    editParameter: () => void
    getDistinctColumnValues: (
      dataSource: string,
      column: string,
      searchTerm?: string
    ) => void
    removeParameterDashboardWidget: () => void
  }
}

const ParameterWidget: FC<Props> = ({
  parameter: {
    name,
    desc,
    type = ParameterTypes.TEXT,
    source,
    column,
    min,
    max,
    stepPrecision = NUMBER_STEP_PRECISIONS.AUTO
  },
  hide,
  value,
  linked,
  showReset,
  resetValue,
  actions: {
    toggleLinked,
    setValue,
    resetToDefaultValue,
    getDistinctColumnValues,
    removeParameterDashboardWidget,
    toggleHide = noop
  },
  columnValues,
  showMenu,
  menuOptions,
  showRemoveIcon,
  renderPopoversToPortal,
  dashboardWidget = false,
  readOnly
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => setMenuOpen(!menuOpen)

  const commonInputProps = {
    value,
    setValue,
    showReset,
    resetToDefaultValue,
    source,
    column,
    renderPopoversToPortal,
    disabled: Boolean(hide || readOnly)
  }

  const joinDataSource = useJoinFromParameter(source)
  let input = <ParameterWidgetInputGeneric {...commonInputProps} />
  const columnData = columnValues[source]?.[column]

  switch (type) {
    case ParameterTypes.COLUMN:
      input = (
        <ParameterWidgetColumnDropdown
          {...{
            ...commonInputProps,
            resetValue
          }}
        />
      )
      break
    case ParameterTypes.COLUMN_VALUE:
      input = (
        <ColumnValueDropdown
          {...{
            ...commonInputProps,
            options: (columnData?.distinctValues || []).map(({ col }) => ({
              value: col,
              label: `${col}`
            })),
            queryForOptions: getDistinctColumnValues
          }}
        />
      )
      break
    case ParameterTypes.NUMBER:
      input = (
        <ParameterWidgetInputNumeric
          {...{
            ...commonInputProps,
            min,
            max,
            resetValue,
            stepPrecision
          }}
        />
      )
      break
    default:
      break
  }

  const displaySource = joinDataSource?.name ?? source
  const metadataText =
    type === ParameterTypes.COLUMN_VALUE
      ? `${displaySource}/${column}`
      : displaySource

  const isSlider = type === ParameterTypes.NUMBER && min && max

  return (
    <div
      className={cx("parameter-widget", {
        "parameter-widget__numeric-slider": isSlider,
        muted: hide
      })}
    >
      <div className={"parameter-widget__data-type-icon"}>
        <div>
          <ParameterTypeIcon type={type} />
        </div>
      </div>
      <div className="parameter-widget__header draggable-container-handle">
        <span className="parameter-widget__name">{name}</span>
        <div className="param-actions-container">
          {!dashboardWidget && (
            <ShowHideButton
              {...{
                hide,
                onClick: toggleHide
              }}
            />
          )}
          {!hide && !readOnly && (
            <ParameterWidgetMenu
              {...{
                menuOptions,
                menuOpen,
                closeMenu,
                showMenu,
                toggleMenu
              }}
            />
          )}
        </div>
      </div>
      <div className="parameter-widget__description">
        {desc && (
          <Tooltip content={desc} enterDelay={500}>
            <span>{desc}</span>
          </Tooltip>
        )}
      </div>
      {!dashboardWidget && !readOnly && (
        <ParameterWidgetLinkToggle
          {...{
            linked,
            toggleLinked,
            disabled: hide
          }}
        />
      )}
      <div className="parameter-widget__input">{input}</div>
      <div className="parameter-widget__source-metadata">
        {(source || column) && <span>{metadataText}</span>}
      </div>
      {showRemoveIcon && !readOnly && (
        <div className="parameter-widget__remove-icon">
          <Icon icon="highlight_off" onClick={removeParameterDashboardWidget} />
        </div>
      )}
    </div>
  )
}

export default ParameterWidget
