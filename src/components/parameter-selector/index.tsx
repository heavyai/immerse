// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import { SecondaryButton } from "widgets/button/Button"
import { Dispatch } from "redux"
import cx from "classnames"

import { userCanEditDashboard } from "utils/privileges"
import { SHOW_PARAMETER_MANAGER_MODAL } from "components/parameter-manager/parameter-action-creators"
import { PENDING_PARAMETER_PROPERTIES } from "components/parameter-manager/constants"
import {
  getUserFacingParameterDefinitions,
  makeGetParameterValue
} from "components/parameters/selectors"
import DataTable from "components/data-table/data-table"
import ParameterManagerIcon from "components/svg-icons/icon-parameter-manager"

import "./parameter-selector.scss"

const mapStateToProps = (state) => {
  const parameterDefinitions = getUserFacingParameterDefinitions(state)
  const getParameterValue = makeGetParameterValue(state)
  const parametersWithCurrentValues = Object.values(parameterDefinitions).map(
    (definition) => ({
      ...definition,
      value: getParameterValue(definition.name)
    })
  )
  const currentTabId = state.dashboard.selectedTabId

  return {
    parameters: parametersWithCurrentValues.filter((param) =>
      param.parentChartTabId ? param.parentChartTabId === currentTabId : true
    ),
    canManageParameters: userCanEditDashboard(state.dashboard.privileges)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: {
    showParameterManager: () => {
      dispatch({
        type: SHOW_PARAMETER_MANAGER_MODAL,
        parameterOnOpen: PENDING_PARAMETER_PROPERTIES
      })
    }
  }
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    parameters: ownProps.filterParameters
      ? stateProps.parameters.filter(ownProps.filterParameters)
      : stateProps.parameters
  }
}

const ParameterSelector = ({
  actions,
  parameters,
  parameterTableOptions,
  onSelectParameter,
  onCreateParameter,
  canManageParameters,
  style,
  parameterSelectorRef,
  customEmptyState,
  showCreateNewParameter = true
}) => {
  const createNewParameter = () => {
    onCreateParameter()
    actions.showParameterManager()
  }

  const emptyState = customEmptyState || (
    <div className="parameter-selector__placeholder">
      <div>
        <span>No parameters found.</span>
        <span>
          {"Go to the "}
          <span tabIndex={-1} onClick={createNewParameter}>
            Parameter Manager <ParameterManagerIcon />
          </span>
        </span>
        <span>to create a new one.</span>
      </div>
    </div>
  )

  return (
    <div
      className={cx("parameter-selector", {
        "parameter-selector--empty": !parameters.length
      })}
      style={style}
      ref={parameterSelectorRef}
    >
      {parameters.length ? (
        <DataTable
          data={parameters}
          dataHeaders={[
            {
              columnHeader: "Name",
              columnKey: "name"
            },
            {
              columnHeader: "Value",
              columnKey: "value"
            }
          ]}
          searchFieldLabel="Search parameters"
          filterTextColumnKey="name"
          onSelectRow={onSelectParameter}
          loading={false}
          {...parameterTableOptions}
        />
      ) : (
        emptyState
      )}
      {canManageParameters && showCreateNewParameter && (
        <SecondaryButton onClick={createNewParameter}>
          <span tabIndex={-1}>Create new</span> <ParameterManagerIcon />
        </SecondaryButton>
      )}
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ParameterSelector)
