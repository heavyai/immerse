// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as RasterChartActions from "charts/raster-chart/raster-chart-actions"
import React, {FC, useState} from "react"
import {connect, ConnectedProps} from "react-redux"
import cx from "classnames"
import HoverSelectorRow from "./hover-selector-row"
import {AppState} from "vega/charts/types";
import {Dispatch} from "redux";
import "./styles.scss"
import {PopupColumnType} from "../../constants/prop-types"
import DataColumnSelector from "../data-column-selector/data-column-selector";
import Popover from "../popover/popover";
import makeDropAndDraggable from "components/selector-pill/make-drop-and-draggable"
import {getDefaultFormat} from "../../utils/formatter-helper";
import { isGeo } from "constants/data-types"

const excludes = (excludedList) => (listItem) => excludedList.every((el) => el.value !== listItem.value)

const mapStateToProps = (state, { chartId, type }: OwnProps) => {
  const chart = state.charts[chartId]
  const source = state.dashboard.dataSources[chart.dataSource]
  const allColumns = source ? source.columnMetadata : []
  const allColumnsWithoutGeoColumns = allColumns.filter((column) => column.label !== "geom" && !isGeo(column.type))
  const selectedColumns = chart.hoverSelectedColumns || []
  const options = allColumnsWithoutGeoColumns.filter(excludes(selectedColumns))
  return {
    type,
    options,
    selectedColumns
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => ({
  actions: {
    addColumn: (newColumn: PopupColumnType) => {
      dispatch(
          RasterChartActions.addPopupColumn(chartId, newColumn)
      )
    },
    removeColumn: (removedColumn: PopupColumnType) => {
      dispatch(
          RasterChartActions.removePopupColumn(chartId, removedColumn)
      )
    },
    updatePopupColumnFormat: (selectedColumn: PopupColumnType, format: string) => {
      dispatch(RasterChartActions.setPopupColumnFormat(chartId, selectedColumn, format))
    },
    swapPopupColumns: (source, target) => {
      if (source !== target) {
        dispatch(RasterChartActions.swapPopupColumns(chartId, source, target))
      }
    }
  }
})

type OwnProps = {
  type: string
  chartId: string
  isGrouped: boolean
}
const connector = connect<
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    OwnProps,
    AppState
    >(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const HoverSelector: FC<Props> = ({
  options,
  selectedColumns,
  isGrouped,
  actions
}) => {
  const [showPopup, setShowPopup] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const removeColumn = (column: PopupColumnType) => {
    actions.removeColumn(column)
  }

  const addColumn = (column: PopupColumnType) => {
    actions.addColumn(column)

    // set default format, Imperial for numeric and "%Y-%m-%d" for time type, to a new popup column
    actions.updatePopupColumnFormat(column, getDefaultFormat(column.type))
  }

  const openPopup = () => {
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
  }

  const onValueChange = (column: PopupColumnType) => {
    if(column) {
      addColumn(column)
      setActiveRow(column)
    }
    closePopup()
  }

  const DraggablePopupColumn = makeDropAndDraggable(HoverSelectorRow)

  return (
    <div
      className={cx("hover-selector", {
        "has-columns": selectedColumns.length
      })}
    >
      {selectedColumns.map((columnOption: PopupColumnType, index: number) => (
        <DraggablePopupColumn
          index={index}
          columnOption={columnOption}
          key={index}
          selectorType={"popupColumns"}
          selectedFormat={columnOption.format || getDefaultFormat(columnOption.type)}
          removeColumn={removeColumn}
          updatePopupColumnFormat={actions.updatePopupColumnFormat}
          swapSelectors={actions.swapPopupColumns}
          isGrouped={isGrouped}
        />
      ))}
      {!isGrouped && <div className="hover-selector-add" onClick={openPopup}>{"+ Add Column"}</div>
      }
      <div className="popup-col-main-section">
        {showPopup && (
        <Popover isOpened onClose={closePopup}>
          <DataColumnSelector
            searchFieldLabel="Search columns"
            data={options}
            onSelectRow={onValueChange}
            activeRow={activeRow}
          />
      </Popover>
      )}
      </div>
    </div>
  )
}

export default connector(HoverSelector)
