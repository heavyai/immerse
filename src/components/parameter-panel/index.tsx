// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { SecondaryButton } from "widgets/button/Button"
import { Menu, MenuSurfaceAnchor } from "@rmwc/menu"
import { Tooltip } from "@rmwc/tooltip"

import { userCanEditDashboard } from "utils/privileges"
import { PENDING_PARAMETER_PROPERTIES } from "components/parameter-manager/constants"
import { SHOW_PARAMETER_MANAGER_MODAL } from "components/parameter-manager/parameter-action-creators"
import { addParameterToPanel } from "components/parameters/actions/parameter-visibility-action-creators"
import {
  makeGetParametersInSet,
  getParameterDefinitions,
  makeGetParameterHide,
  getParameterSetIdForSelectedTab,
  getParamSetById,
  makeParameterIsVisibleInPanel
} from "components/parameters/selectors"
import {
  ParameterDefinition,
  ParameterTypes
} from "components/parameters/parameters-types"

import ParameterManagerIcon from "components/svg-icons/icon-parameter-manager"
import ParameterSelector from "components/parameter-selector"

import ParameterWidget from "components/parameter-widget"
import { ParameterData } from "../parameter-widget/parameter-widget-types"
import "./parameter-panel.scss"
import { setHideHiddenParameterSet } from "../parameters/actions"

const mapStateToProps = (state) => {
  const getParameterHide = makeGetParameterHide(state)
  const parameterSetNames = makeGetParametersInSet(state)()
  const parameterDefinitions = getParameterDefinitions(state)
  const paramSetId = getParameterSetIdForSelectedTab(state)
  const paramSet = getParamSetById(state)(paramSetId)
  const parameterIsVisibleInPanel = makeParameterIsVisibleInPanel(state)
  return {
    parameterDefinitions,
    parameters: Object.values(
      [...parameterSetNames].map((name) => {
        return parameterDefinitions[name]
      })
    ).filter((p) => parameterIsVisibleInPanel(p.name)),
    getParameterHide,
    columnValues: state.columnValues,
    hasDashboardEditPrivileges: userCanEditDashboard(
      state.dashboard.privileges
    ),
    dataSources: state.dashboard.dataSources,
    hideHiddenParameters: paramSet.hideHidden,
    paramSetId
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: {
    openParameterManager: (parameter: ParameterData) => {
      dispatch({
        type: SHOW_PARAMETER_MANAGER_MODAL,
        parameterOnOpen: parameter
      })
    },
    addParameterToPanel: ({ name, defaultValue }: ParameterDefinition) => {
      dispatch(addParameterToPanel(name, defaultValue))
    }
  },
  toggleHideHiddenParameters: (paramSetId, hideHiddenParameters) =>
    dispatch(setHideHiddenParameterSet(paramSetId, !hideHiddenParameters))
})

const ParameterPanel = ({
  parameters,
  parameterDefinitions,
  actions,
  hasDashboardEditPrivileges,
  hideHiddenParameters,
  getParameterHide,
  toggleHideHiddenParameters,
  paramSetId
}: {
  parameters: ParameterData[]
  parameterDefinitions: Record<string, ParameterDefinition>
  hasDashboardEditPrivileges: boolean
}) => {
  const [addParameterMenuOpen, setAddParameterMenuOpen] = useState(false)
  const onSelectParameter = (param: ParameterDefinition) => {
    actions.addParameterToPanel(param)
    setAddParameterMenuOpen(false)
  }
  const sortedParameters = parameters.sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const shownParameters = sortedParameters.filter(
    (param) => !getParameterHide(param.name)
  )
  const hiddenParameters = sortedParameters.filter((param) =>
    getParameterHide(param.name)
  )

  return (
    <div className={"parameter-panel dashboard-config-panel"}>
      <div className={"parameter-panel__header"}>
        <h5>Parameters</h5>
        {hasDashboardEditPrivileges && (
          <Tooltip content="Open parameter manager" enterDelay={500}>
            <div onClick={() => actions.openParameterManager()}>
              <ParameterManagerIcon />
            </div>
          </Tooltip>
        )}
      </div>

      <div className={"parameter-panel__content"}>
        {hasDashboardEditPrivileges && (
          <MenuSurfaceAnchor>
            <Menu
              open={addParameterMenuOpen}
              hoistToBody
              className="parameter-panel__selector-menu"
              onClose={() => setAddParameterMenuOpen(false)}
              anchorCorner="bottomLeft"
            >
              <ParameterSelector
                onSelectParameter={onSelectParameter}
                onCreateParameter={() => setAddParameterMenuOpen(false)}
              />
            </Menu>
            <SecondaryButton
              onClick={() => {
                if (Object.keys(parameterDefinitions).length > 0) {
                  setAddParameterMenuOpen(true)
                } else {
                  actions.openParameterManager(PENDING_PARAMETER_PROPERTIES)
                }
              }}
            >
              Add parameter
            </SecondaryButton>
          </MenuSurfaceAnchor>
        )}
        {shownParameters.map((parameter) => (
          <ParameterWidget
            key={parameter.name}
            parameter={parameter}
            readOnly={parameter.type === ParameterTypes.COORDINATE}
          />
        ))}
        {Boolean(hiddenParameters?.length) && (
          <div className="hide-hidden-link">
            <a
              {...{
                href: "#",
                onClick: (ev) => {
                  ev.preventDefault()
                  toggleHideHiddenParameters(paramSetId, hideHiddenParameters)
                }
              }}
            >
              <span>Show Hidden Parameters</span>
              {!hideHiddenParameters && <span>&#8212;</span>}
            </a>
          </div>
        )}
        {!hideHiddenParameters &&
          hiddenParameters.map((parameter) => (
            <ParameterWidget key={parameter.name} parameter={parameter} />
          ))}
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ParameterPanel)
