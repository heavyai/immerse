// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useMemo } from "react"
import { connect } from "react-redux"
import { isEqual, omit } from "lodash"
import cx from "classnames"

import { MultiSelect } from "widgets/multi-select/Multi-select"
import { SimpleDialog, SimpleWarningDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { Checkbox } from "@rmwc/checkbox"
import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"
import { sortedDataSourcesSelector } from "selectors/data-sources"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { isValidName, isValidParameter } from "components/parameters/validation"
import { getAllDataSources } from "components/custom-sql-manager/custom-sql-manager-utils"
import { ParameterTypes } from "components/parameters/parameters-types"
import {
  addParameterDefinition,
  updateParameterDefinition,
  removeParameterDefinition
} from "components/parameters/actions/parameter-definitions-action-creators"
import { addParameterToParameterSet } from "components/parameters/actions/parameter-sets-action-creators"
import { linkParameter } from "components/parameters/actions/parameter-link-actions"
import {
  getUserFacingParameterDefinitions,
  makeIsParameterInUse
} from "components/parameters/selectors"
import { getParameterTypeFields } from "components/parameter-manager/parameter-type-fields"
import DataTable from "components/data-table/data-table"
import { HIDE_PARAMETER_MANAGER_MODAL } from "./parameter-action-creators"
import { getDataSourcesList } from "actions/tables-action-creators"
import { getDataSourcePreview } from "actions/table-preview-action-creators"
import {
  PENDING_PARAMETER_PROPERTIES,
  PENDING_PARAMETER_DISPLAY_ROW,
  PARAMETER_TYPE_PROPERTIES,
  UNSAVED_INDICATOR,
  WARNING_TYPE_UNSAVED,
  WARNING_DIALOG_CONTENT
} from "./constants"

import "./parameter-manager.scss"
import { NUMBER_STEP_PRECISIONS } from "../parameters/constants"

const mapStateToProps = (state) => ({
  allDataSources: sortedDataSourcesSelector(
    state.dashboard.dataSources,
    state.tables.list
  ),
  loadingDataSources: state.tables.loading,
  dataSourcesForDashboard: getAllDataSources(state),
  savedParameters: getUserFacingParameterDefinitions(state),
  parameterOnOpen: state.ui.modal.parameterManagerProps.parameterOnOpen,
  tablePreview: state.tablePreview,
  isParameterInUse: makeIsParameterInUse(state)
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    addParameterDefinition: (definition) => {
      dispatch(addParameterDefinition(definition))
    },
    addParameterToParameterSet: ({ name, defaultValue }) => {
      dispatch(addParameterToParameterSet({ name }))
      dispatch(linkParameter(name, defaultValue))
    },
    updateParameterDefinition: (definition) => {
      dispatch(updateParameterDefinition(definition))
    },
    removeParameterDefinition: (name) => {
      dispatch(removeParameterDefinition(name))
    },
    closeModal: () => {
      dispatch({
        type: HIDE_PARAMETER_MANAGER_MODAL
      })
    },
    getDataSourcesList: () => {
      dispatch(getDataSourcesList())
    },
    getDataSourcePreview: (source: string) => {
      dispatch(getDataSourcePreview(source))
    }
  }
})

const parameterTypeRequiresSource = (type) =>
  [ParameterTypes.COLUMN, ParameterTypes.COLUMN_VALUE].includes(type)

const ParameterManager = ({
  allDataSources,
  loadingDataSources,
  dataSourcesForDashboard,
  savedParameters,
  parameterOnOpen,
  tablePreview,
  isParameterInUse,
  actions
}) => {
  const [parameters, setParameters] = useState(savedParameters)
  const [parameterList, setParameterList] = useState([])
  const [currentParameter, setCurrentParameter] = useState({})
  const [pendingParameter, setPendingParameter] = useState({})
  const [shouldAddParameterToTab, setShouldAddParameterToTab] = useState(false)
  const [warningContent, setWarningContent] = useState(null)
  const [showErrors, setShowErrors] = useState(false)

  const parameterToEdit = useMemo(
    () =>
      currentParameter?.pending
        ? pendingParameter
        : parameters[currentParameter.name] || {},
    [
      pendingParameter,
      parameters,
      currentParameter?.pending,
      currentParameter.name
    ]
  )

  useEffect(() => {
    if (
      parameterTypeRequiresSource(parameterToEdit?.type) &&
      allDataSources.every((dataSourceGroup) => !dataSourceGroup.length) &&
      !loadingDataSources
    ) {
      actions.getDataSourcesList()
    }
  }, [actions, parameterToEdit, allDataSources, loadingDataSources])

  // If the selected data source is already in use in the dashboard, we can get
  // its columns from metadata already stored in the dashboard state. Otherwise,
  // fetch columns.
  useEffect(() => {
    const { source, type } = parameterToEdit

    if (
      source &&
      parameterTypeRequiresSource(type) &&
      !dataSourcesForDashboard[source] &&
      tablePreview.tableName !== source &&
      !tablePreview.loading
    ) {
      actions.getDataSourcePreview(source)
    }
  }, [
    actions,
    allDataSources,
    dataSourcesForDashboard,
    tablePreview.tableName,
    tablePreview.loading,
    pendingParameter,
    parameterToEdit
  ])

  useEffect(() => {
    setParameters(savedParameters)
  }, [savedParameters])

  useEffect(() => {
    const savedParameterList = Object.keys(savedParameters).map(
      (name) => savedParameters[name]
    )

    setParameterList(
      pendingParameter.pending
        ? [...savedParameterList, PENDING_PARAMETER_DISPLAY_ROW]
        : savedParameterList
    )
  }, [savedParameters, pendingParameter.pending])

  useEffect(() => {
    if (parameterOnOpen?.pending || parameterOnOpen?.name) {
      setCurrentParameter({
        stepPrecision: NUMBER_STEP_PRECISIONS.AUTO,
        ...parameterOnOpen
      })
    }

    if (parameterOnOpen?.pending) {
      setPendingParameter(parameterOnOpen)
    }
  }, [parameterOnOpen])

  useEffect(() => {
    setShowErrors(false)
  }, [currentParameter, pendingParameter.type])

  const parameterHasUnsavedChanges = (parameter) =>
    (parameter.pending &&
      !isEqual(
        omit(pendingParameter, "type"),
        omit(PENDING_PARAMETER_PROPERTIES, "type")
      )) ||
    !isEqual(parameters[parameter.name], savedParameters[parameter.name])

  const hasUnsavedChanges = () =>
    parameterList.some((parameter) => parameterHasUnsavedChanges(parameter))

  const isValidPendingParameterName = (name) =>
    isValidName(name) &&
    !savedParameters[name] &&
    !name.match(/^(GLOBAL|CUSTOM)_/i)

  const isValidPendingParameter = (parameter) =>
    isValidPendingParameterName(parameter.name) && isValidParameter(parameter)

  const getWarningContent = (type, action) => ({
    ...WARNING_DIALOG_CONTENT[type],
    action
  })

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      setWarningContent(
        getWarningContent(WARNING_TYPE_UNSAVED, () => actions.closeModal())
      )
    } else {
      actions.closeModal()
    }
  }

  const handleCancel = () => {
    if (currentParameter.pending) {
      setPendingParameter({})
    } else {
      // Reset parameter to saved values
      setParameters({
        ...parameters,
        [currentParameter.name]: savedParameters[currentParameter.name]
      })
    }

    setCurrentParameter({})
  }

  const handleSavePending = () => {
    if (isValidPendingParameter(pendingParameter)) {
      delete pendingParameter.pending
      actions.addParameterDefinition(pendingParameter)

      if (shouldAddParameterToTab) {
        actions.addParameterToParameterSet(pendingParameter)
      }

      setCurrentParameter({ name: pendingParameter.name })
      setPendingParameter({})
    } else {
      setShowErrors(true)
    }
  }

  const handleSaveExisting = () => {
    if (isValidParameter(parameters[currentParameter.name])) {
      actions.updateParameterDefinition(parameters[currentParameter.name])
    } else {
      setShowErrors(true)
    }
  }

  const cleanPendingParameter = () => {
    setPendingParameter({
      ...pendingParameter,
      name: pendingParameter.name.trim()
    })
  }

  const parameterTableData = parameterList.map((parameter) => ({
    ...parameter,
    type: parameter.pending ? "" : parameter.type || ParameterTypes.TEXT,
    displayName: `${
      parameterHasUnsavedChanges(parameter) || parameter.pending
        ? UNSAVED_INDICATOR
        : ""
    }${parameter.name}`
  }))

  const setParameterProperties = (properties) =>
    currentParameter.pending
      ? setPendingParameter({
          ...pendingParameter,
          ...properties
        })
      : setParameters({
          ...parameters,
          [currentParameter.name]: {
            ...parameters[currentParameter.name],
            ...properties
          }
        })

  const {
    DASHBOARD_TABS,
    CREATE_COORDINATE_PARAMETERS
  } = available_feature_flags

  return (
    <>
      <SimpleDialog
        open
        className="parameter-manager"
        title="Parameter Manager"
        onClose={handleCloseModal}
      >
        <div className="parameter-manager__layout">
          <div className="parameter-manager__browser">
            <DataTable
              data={parameterTableData}
              dataHeaders={[
                {
                  columnHeader: "Parameter Name",
                  columnKey: "displayName"
                },
                {
                  columnHeader: "Default Value",
                  columnKey: "defaultValue"
                },
                {
                  columnHeader: "Type",
                  columnKey: "type"
                }
              ]}
              searchFieldLabel="Search parameters"
              filterTextColumnKey="name"
              hideFilterCategoryOptions
              filterCategoryColumnKey="type"
              getFilterCategoryLabel={(type) =>
                PARAMETER_TYPE_PROPERTIES[type]?.label
              }
              getFilterCategoryIcon={(type) =>
                PARAMETER_TYPE_PROPERTIES[type]?.icon
              }
              activeRow={parameterTableData.find((parameter) =>
                currentParameter.pending
                  ? parameter.pending
                  : parameter.name === currentParameter.name
              )}
              onSelectRow={(parameter) => setCurrentParameter(parameter)}
              rowIconOptions={{
                icon: "delete",
                title: "Delete Parameter",
                alignRight: true,
                action: (parameter) => {
                  if (parameter.pending) {
                    setPendingParameter({})

                    if (currentParameter.pending) {
                      setCurrentParameter({})
                    }
                  } else if (!isParameterInUse(parameter.name)) {
                    actions.removeParameterDefinition(parameter.name)
                  }
                },
                isDisabled: ({ name, pending, type }) =>
                  (!pending && isParameterInUse(name)) ||
                  type === ParameterTypes.COORDINATE,
                disabledIconTooltip: ({ type }) =>
                  type === ParameterTypes.COORDINATE
                    ? "This parameter is linked to a currently applied filter."
                    : "This parameter is currently is in use."
              }}
            />

            <footer>
              <SecondaryButton
                className="parameter-manager__create-new"
                disabled={pendingParameter.pending}
                onClick={() => {
                  setCurrentParameter({ pending: true })
                  setShouldAddParameterToTab(false)
                  setPendingParameter(PENDING_PARAMETER_PROPERTIES)
                }}
              >
                Create new parameter
              </SecondaryButton>
            </footer>
          </div>
          <div
            className={cx("parameter-manager__editor", {
              "parameter-manager__editor--empty": parameterList.length === 0
            })}
          >
            {parameterList.length === 0 && !currentParameter.pending && (
              <p>
                Nothing found here.
                <br />
                Click &quot;Create new&quot; to create your first parameter.
              </p>
            )}

            {(currentParameter.pending ||
              parameters[currentParameter.name]) && (
              <>
                {currentParameter.pending ? (
                  <>
                    <MultiSelect
                      options={Object.keys(PARAMETER_TYPE_PROPERTIES)
                        .filter(
                          (type) =>
                            type !== ParameterTypes.COORDINATE ||
                            getFeatureFlag(CREATE_COORDINATE_PARAMETERS)
                        )
                        .map((type) => ({
                          label: PARAMETER_TYPE_PROPERTIES[type]?.label,
                          value: type
                        }))}
                      placeholder="Parameter type"
                      value={{
                        label:
                          PARAMETER_TYPE_PROPERTIES[pendingParameter.type]
                            ?.label,
                        value: pendingParameter.type
                      }}
                      onChange={(option) => {
                        const { name, desc } = pendingParameter

                        setPendingParameter({
                          ...PENDING_PARAMETER_PROPERTIES,
                          type: option.value,
                          name,
                          desc
                        })
                      }}
                    />

                    <Tooltip
                      showArrow
                      // Sometimes tooltip doesn't correctly clear when changing error states
                      key={`${pendingParameter.type}-name-${showErrors}`}
                      content={
                        <p className="parameter-manager__tooltip">
                          Parameter names should be unique and can contain
                          <br />
                          alphanumeric characters, underscores, or spaces
                        </p>
                      }
                      activateOn="focus"
                      {...(showErrors
                        ? {
                            open: !isValidPendingParameterName(
                              pendingParameter.name
                            )
                          }
                        : {})}
                    >
                      <TextField
                        invalid={
                          showErrors &&
                          !isValidPendingParameterName(pendingParameter.name)
                        }
                        label="Parameter Name"
                        value={pendingParameter.name}
                        onChange={(e) =>
                          setPendingParameter({
                            ...pendingParameter,
                            name: e.currentTarget.value
                          })
                        }
                        onBlur={cleanPendingParameter}
                      />
                    </Tooltip>
                  </>
                ) : (
                  <h3>{currentParameter.name}</h3>
                )}

                {getParameterTypeFields({
                  parameter: parameterToEdit,
                  setParameterProperties,
                  showErrors,
                  allDataSources:
                    allDataSources || Object.keys(dataSourcesForDashboard),
                  savedColumnMetadata: dataSourcesForDashboard,
                  tablePreviewMetadata: tablePreview,
                  readOnly:
                    parameterToEdit?.type === ParameterTypes.COORDINATE &&
                    !getFeatureFlag(CREATE_COORDINATE_PARAMETERS)
                })}

                <TextField
                  textarea
                  rows={6}
                  label="Description (optional)"
                  value={
                    currentParameter.pending
                      ? pendingParameter.desc
                      : parameters[currentParameter.name].desc
                  }
                  onChange={(e) =>
                    setParameterProperties({ desc: e.currentTarget.value })
                  }
                />

                {currentParameter.pending && getFeatureFlag(DASHBOARD_TABS) && (
                  <div className="parameter-manager__editor__add-tab">
                    <Checkbox
                      id="add-parameter-to-tab-checkbox"
                      ripple={false}
                      checked={shouldAddParameterToTab}
                      onChange={() =>
                        setShouldAddParameterToTab(!shouldAddParameterToTab)
                      }
                    />
                    <label htmlFor="add-parameter-to-tab-checkbox">
                      Add parameter to current tab
                    </label>
                  </div>
                )}

                <footer>
                  <SecondaryButton onClick={handleCancel}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    disabled={!parameterHasUnsavedChanges(parameterToEdit)}
                    onClick={
                      currentParameter.pending
                        ? handleSavePending
                        : handleSaveExisting
                    }
                  >
                    {currentParameter.pending ? "Create" : "Update"}
                  </PrimaryButton>
                </footer>
              </>
            )}
          </div>
        </div>
      </SimpleDialog>
      {warningContent && (
        <SimpleWarningDialog
          className="parameter-manager__unsaved-warning"
          open={warningContent}
          hideCloseIcon
          title={warningContent.title}
          message={warningContent.message}
          primaryAction={warningContent.action}
          primaryLabel={warningContent.buttonLabel}
          secondaryAction={() => setWarningContent(null)}
        />
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ParameterManager)
