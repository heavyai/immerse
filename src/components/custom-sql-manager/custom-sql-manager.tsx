// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { isEmpty, startCase } from "lodash"
import { Tooltip } from "@rmwc/tooltip"
import { CircularProgress } from "@rmwc/circular-progress"

import { SimpleDialog } from "widgets/dialog/Dialog"
import {
  WarningButton,
  PrimaryButton,
  SecondaryButton
} from "widgets/button/Button"
import { TextField } from "widgets/text-field/TextField"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import {
  customDimension as oldSelectorSubmitDimension,
  customMeasure as oldSelectorSubmitMeasure,
  customPostFilter as oldSelectorSubmitPostFilter
} from "actions/custom-selector-thunks"
import { clearParameterizedCustomDimensionSelectors } from "vega/actions/data-selection-thunks"
import {
  submitCustomSqlDimension,
  submitCustomSqlMeasure
} from "vega/actions/custom-sql-data-selection-thunks"

import { sqlFilter } from "vega/constants/filter-types"
import { createCustomSqlExpression } from "vega/utils/data-selection"

import { process as processSQL } from "utils/ImmerseSQLPlusPlus/parser"
import {
  updateGlobalExpressionAsync,
  deleteGlobalExpressionsAsync
} from "utils/global-expressions"
import {
  addParameterDefinition,
  updateParameterDefinition,
  removeParameterDefinition
} from "components/parameters/actions"
import { simpleSetParameterValue } from "components/parameters/actions/simple-action-wrappers"
import {
  isGlobalCustomSqlParameter,
  ParameterTypes
} from "components/parameters/parameters-types"
import {
  getParameterDefinitions,
  makeGetParameterUsage,
  makeGetParameterValue,
  makeIsAllowedDisplayName
} from "components/parameters/selectors"
import { setCustomSqlFilterError } from "components/new-filters/filters-actions"
import { clearCustomMeasuresByValue } from "vega/actions/data-selection-action-creators"
import { clearFilterByName } from "vega/actions/filter-action-creators"
import { makeGetParameterizedCustomSqlFiltersByValue } from "components/new-filters/filter-selectors"
import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"

import CustomSQLSideBrowser from "components/custom-sql-side-browser/custom-sql-side-browser"
import { varFinderRegexPattern } from "utils/ImmerseSQLPlusPlus/parser-tokens"
import { isValidName, sourceNameRegex } from "components/parameters/validation"

import {
  CustomSQLTypes,
  closeCustomSQLManager
} from "./custom-sql-manager-actions"

import "./custom-sql-manager.scss"

import CustomSqlManagerConfimationModal from "./custom-sql-manager-confimation-modal"
import {
  chartIsRendered,
  CONFIRMATION_MODAL_TYPES,
  parameterTypeToHeader
} from "./custom-sql-manager-utils"
import { removeSelector } from "../../actions/charts-action-creators"
import {
  available_feature_flags,
  getFeatureFlag
} from "../control-panel/featureflags"
import {
  submitCustomSql,
  validateCustomSqlFilter
} from "../new-filters/custom-filters-thunks"

const CustomSQLManager = ({
  actions,
  activeDataSource,
  customSQLExpression,
  customSQLExpressionScope,
  customSQLFilterError,
  customSQLName,
  defaultCustomSQLName,
  showInUseWarning,
  isAllowedDisplayName,
  canWriteGlobalExpressions,
  disableScopeField,
  disableNameField,
  disableExpressionField,
  parameterId,
  globalExpressionId,
  warningText
}) => {
  const [expressionName, setExpressionName] = useState(
    customSQLName || defaultCustomSQLName
  )
  const [expression, setExpression] = useState(customSQLExpression || "")
  const [expressionScope, setExpressionScope] = useState(
    customSQLExpressionScope || "LOCAL"
  )
  const [confirmationModalType, setConfirmationModalType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)

  const refTextArea = useRef()

  const sharedCustomEnabled = getFeatureFlag(
    available_feature_flags.ENABLE_DASHBOARD_SHARED_CUSTOM_SQL
  )

  useEffect(() => {
    setExpressionName(
      customSQLName || (sharedCustomEnabled ? "" : defaultCustomSQLName)
    )
  }, [customSQLName, defaultCustomSQLName, sharedCustomEnabled])

  useEffect(() => {
    setExpression(customSQLExpression || "")
  }, [customSQLExpression])

  useEffect(() => {
    setExpressionScope(customSQLExpressionScope || "LOCAL")
  }, [customSQLExpressionScope])

  useEffect(() => {
    setLoading(false)
  }, [customSQLFilterError])

  const insertValueIntoExpression = (value: string) => {
    const cursorPosition = refTextArea.current.selectionStart

    setExpression(
      (currentExpression) =>
        `${currentExpression.slice(
          0,
          cursorPosition
        )}${value}${currentExpression.slice(cursorPosition)}`
    )
  }

  // Some minimal clientside SQL validation.
  const validateSQL = () => {
    // Global custom expressions can not use parameters
    const varFinderRegex = new RegExp(varFinderRegexPattern, "gs")
    if (expressionScope === "GLOBAL" && expression.match(varFinderRegex)) {
      actions.setCustomSqlFilterError(
        "Parameters may not be used in global expressions"
      )
      return
    }
    if (!isValidName(expressionName)) {
      actions.setCustomSqlFilterError(
        "Invalid name. Only alphanumeric characters, hyphens, and spaces are allowed"
      )
      return
    }
    try {
      processSQL(expression, {
        onProcessComplete: ({ invalidParameters }) => {
          // This check will only apply to local scope expressions
          // since global expression check happens above
          if (invalidParameters.size) {
            actions.setCustomSqlFilterError(
              `Unrecognized parameters: ${[...invalidParameters].join(",")}.`
            )
          } else {
            setLoading(true)
            actions.submitSQLExpression(
              expression,
              expressionName,
              expressionScope
            )
          }
        },
        useDisplayName: true
      })
    } catch (e) {
      actions.setCustomSqlFilterError(e.message)
    }
  }

  const primaryAction =
    customSQLExpression && showInUseWarning
      ? () => setConfirmationModalType(CONFIRMATION_MODAL_TYPES.MODIFY)
      : validateSQL

  const onClickApply = () => {
    if (isEmpty(expressionName)) {
      setDisplayNameError("Custom SQL name is required")
    } else if (!isAllowedDisplayName(expressionName)) {
      setDisplayNameError("Custom SQL name must be unique")
    } else {
      primaryAction()
    }
  }

  const onNameFieldChange = (e) => {
    setExpressionName(e.currentTarget.value)
    setDisplayNameError(null)
  }

  return (
    <SimpleDialog
      title={`${startCase(defaultCustomSQLName)} Editor`}
      footer={
        <>
          <div>
            {actions.deleteSQLExpression && (
              <WarningButton
                onClick={() => {
                  if (parameterId) {
                    setConfirmationModalType(
                      CONFIRMATION_MODAL_TYPES.DELETE_SHARED
                    )
                  } else if (globalExpressionId) {
                    setConfirmationModalType(
                      CONFIRMATION_MODAL_TYPES.DELETE_GLOBAL
                    )
                  }
                }}
              >
                Delete
              </WarningButton>
            )}
          </div>
          <div>
            <SecondaryButton
              disabled={loading}
              onClick={actions.closeCustomSQLManager}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={onClickApply}
              disabled={isEmpty(expression) || loading}
              data-testid="custom-sql-manager-apply"
              icon={loading ? <CircularProgress /> : null}
            >
              Apply {defaultCustomSQLName.toLowerCase()}
            </PrimaryButton>
          </div>
        </>
      }
      open
      onClose={actions.closeCustomSQLManager}
      className="custom-sql-manager"
    >
      {confirmationModalType && (
        <CustomSqlManagerConfimationModal
          modalType={confirmationModalType}
          applyAction={validateSQL}
          closeConfirmationModal={() => {
            setConfirmationModalType(null)
          }}
          deleteAction={actions.deleteSQLExpression}
          inUse={showInUseWarning}
          warningText={warningText}
        />
      )}
      <div className="custom-sql-manager__layout">
        <div className="custom-sql-manager__editor">
          <div className="custom-sql-manager__name">
            <Tooltip
              content={displayNameError}
              open={Boolean(displayNameError)}
            >
              <TextField
                maxLength={50}
                onChange={onNameFieldChange}
                label="Name *"
                value={expressionName}
                autoFocus={activeDataSource && expression}
                disabled={!activeDataSource || disableNameField}
                invalid={Boolean(displayNameError)}
              />
            </Tooltip>
            {canWriteGlobalExpressions && (
              <MultiSelect
                blurInputOnSelect
                placeholder="Scope"
                value={
                  expressionScope === "LOCAL"
                    ? {
                        label: `Local to this ${
                          sharedCustomEnabled ? "dashboard" : "chart"
                        }`,
                        value: "LOCAL"
                      }
                    : { label: "Global across dashboards", value: "GLOBAL" }
                }
                onChange={(e) => setExpressionScope(e.value)}
                isDisabled={!activeDataSource || disableScopeField}
                options={[
                  {
                    label: `Local to this ${
                      sharedCustomEnabled ? "dashboard" : "chart"
                    }`,
                    value: "LOCAL"
                  },
                  { label: "Global across dashboards", value: "GLOBAL" }
                ]}
              />
            )}
          </div>
          <textarea
            disabled={!activeDataSource || disableExpressionField}
            ref={refTextArea}
            className="custom-sql-manager__expression"
            placeholder="Enter SQL statement"
            onChange={(e) => {
              if (customSQLFilterError) {
                actions.setCustomSqlFilterError("")
              }

              setExpression(e.currentTarget.value)
            }}
            value={expression}
            data-testid="custom-sql-manager-expression"
          />
          {customSQLFilterError && (
            <div className="custom-sql-manager__error">
              {customSQLFilterError}
            </div>
          )}
        </div>
        <CustomSQLSideBrowser
          activeDataSource={activeDataSource}
          onSelectRow={insertValueIntoExpression}
          disableParameterBrowser={expressionScope === "GLOBAL"}
        />
      </div>
    </SimpleDialog>
  )
}

function mapStateToProps(state) {
  const {
    customSQLType,
    selectorExpression,
    parameterName,
    activeDataSource
  } = state.ui.customSQLManagerProps

  const filterEditing = state.ui.filters.filterEditing || {}
  const currParamValue = makeGetParameterValue(state)

  const parameterDefinition =
    parameterName && getParameterDefinitions(state)[parameterName]
  const parameterUsage =
    (parameterName && makeGetParameterUsage(state)(parameterName)) || new Set()
  const chart = state.charts[state.ui.customSQLManagerProps.chartId]
  const clearSelectorsOnDelete =
    chart &&
    // Removing selectors has side effects, most notably possibly clearing crossfilters,
    // so avoid this if the custom selector is not in use for this chart.
    (parameterUsage.has(state.ui.customSQLManagerProps.chartId) ||
      // Annoyingly, the selectors in use for this chart won't be recorded to parameter
      // usage state if the chart isn't currently rendered. The aforementioned
      // side effects should be harmless in this case, so we should be fine assuming
      // they're in use.
      !chartIsRendered(chart))

  parameterUsage.delete(state.ui.customSQLManagerProps.chartId)

  const expressionIsUsedInOtherCharts = Boolean(parameterUsage.size)

  const getParameterizedCustomSqlFiltersByValue = makeGetParameterizedCustomSqlFiltersByValue(
    state
  )
  const filtersUsingParameter = getParameterizedCustomSqlFiltersByValue(
    `\${${parameterName}}`
  )

  const expressionIsUsedInThisFilter =
    filterEditing &&
    filtersUsingParameter.some((f) => f.name === filterEditing.name)
  const expressionIsUsedInOtherFilters =
    filterEditing && expressionIsUsedInThisFilter
      ? filtersUsingParameter.length > 1
      : filtersUsingParameter.length > 0

  const EXPRESSION_PROPERTIES = {
    [CustomSQLTypes.CUSTOM_SQL_FILTER]: {
      defaultCustomSQLName: "Custom filter",
      customSQLName: filterEditing?.dataExpression,
      customSQLExpression: filterEditing?.sql
    },
    [CustomSQLTypes.CUSTOM_SQL_DIMENSION]: {
      defaultCustomSQLName: "Custom dimension",
      customSQLName: selectorExpression?.name,
      customSQLExpression: selectorExpression?.sql
    },
    [CustomSQLTypes.CUSTOM_SQL_MEASURE]: {
      defaultCustomSQLName: "Custom measure",
      customSQLName: selectorExpression?.name,
      customSQLExpression: selectorExpression?.sql
    },
    [CustomSQLTypes.CUSTOM_SQL_POST_FILTER]: {
      defaultCustomSQLName: "Custom post filter",
      customSQLName: selectorExpression?.name,
      customSQLExpression: selectorExpression?.sql
    },
    [CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED]: {
      defaultCustomSQLName: `Custom ${parameterTypeToHeader(
        parameterDefinition?.type
      )}`,
      customSQLName: parameterDefinition?.displayName || "",
      customSQLExpression: parameterName && currParamValue(parameterName),
      parameterId: parameterName,
      disableNameField: true
    },
    [CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL]: {
      defaultCustomSQLName: `Custom ${parameterTypeToHeader(
        parameterDefinition?.type
      )}`,
      customSQLName: parameterDefinition?.displayName || "",
      customSQLExpression: parameterName && currParamValue(parameterName),
      customSQLExpressionScope: "GLOBAL",
      globalExpressionId:
        parameterName &&
        parameterDefinition &&
        isGlobalCustomSqlParameter(parameterDefinition) &&
        parameterDefinition.globalExpressionId,
      disableScopeField: true,
      disableNameField: true
    }
  }

  return {
    ...state.ui.customSQLManagerProps,
    ...EXPRESSION_PROPERTIES[customSQLType],
    filterEditing,
    customSQLFilterError: state.ui.customSQLFilterError,
    parameterDefinition,
    showInUseWarning:
      getFeatureFlag(
        available_feature_flags.ENABLE_DASHBOARD_SHARED_CUSTOM_SQL
      ) &&
      (parameterDefinition?.type === ParameterTypes.CUSTOM_FILTER
        ? expressionIsUsedInOtherFilters
        : expressionIsUsedInOtherCharts),
    warningText:
      parameterDefinition?.type === ParameterTypes.CUSTOM_FILTER
        ? "filter"
        : "chart",
    expressionIsUsedInOtherCharts,
    expressionIsUsedInOtherFilters,
    filtersUsingParameter,
    clearSelectorsOnDelete,
    canWriteGlobalExpressions:
      activeDataSource?.match(sourceNameRegex) && // can not create global expression for custom datasource
      getFeatureFlag(available_feature_flags.ENABLE_GLOBAL_CUSTOM_SQL) &&
      state.connection.isSuperuser &&
      [
        CustomSQLTypes.CUSTOM_SQL_DIMENSION,
        CustomSQLTypes.CUSTOM_SQL_MEASURE,
        CustomSQLTypes.CUSTOM_SQL_FILTER,
        CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL
      ].includes(customSQLType),
    isAllowedDisplayName: makeIsAllowedDisplayName(state)(
      parameterDefinition?.name
    ),

    // TODO: Destroy when old selectors are replaced
    charts: state.charts
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      closeCustomSQLManager,
      setCustomSqlFilterError,
      submitCustomSql,
      submitCustomSqlDimension,
      submitCustomSqlMeasure,
      addParameterDefinition,
      updateParameterDefinition,
      removeParameterDefinition,
      simpleSetParameterValue,
      removeSelector,
      clearParameterizedCustomDimensionSelectors,
      clearCustomMeasuresByValue,
      clearFilterByName,
      validateCustomSqlFilter,

      // TODO: Destroy when old selectors are replaced
      oldSelectorSubmitDimension,
      oldSelectorSubmitMeasure,
      oldSelectorSubmitPostFilter
    },
    dispatch
  )
})

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    activeDataSource,
    chartId,
    charts,
    customSQLType,
    filterEditing,
    layerId,
    shouldAutoEnable,
    selectorName,
    selectorIndex,
    parameterId,
    globalExpressionId,
    selectorType,
    clearSelectorsOnDelete,
    filtersUsingParameter,

    // TODO: Destroy when old selectors are replaced
    isOldSelector
  } = stateProps

  const applyCustomSQLFilter = (
    expression: string,
    name: string,
    scope: "LOCAL" | "GLOBAL"
  ) => {
    dispatchProps.actions.submitCustomSql(
      filterEditing,
      expression === ""
        ? null
        : sqlFilter(activeDataSource, activeDataSource, expression, name),
      shouldAutoEnable,
      scope === "GLOBAL" ? false : stateProps.shared,
      scope === "GLOBAL"
    )
  }

  const applyCustomSQLDimension = (
    expression: string,
    name: string,
    scope: "LOCAL" | "GLOBAL"
  ) => {
    if (isOldSelector) {
      // TODO: Destroy when old selectors are replaced
      dispatchProps.actions.oldSelectorSubmitDimension(
        chartId,
        charts[chartId].type,
        selectorIndex,
        {
          value: expression,
          custom: true,
          isError: false,
          label: name || "Custom Dimension",
          type: "CUSTOM"
        },
        layerId,
        scope === "GLOBAL" ? false : stateProps.shared,
        scope === "GLOBAL"
      )
      dispatchProps.actions.closeCustomSQLManager()
    } else {
      dispatchProps.actions.submitCustomSqlDimension(
        chartId,
        layerId,
        selectorName,
        selectorIndex,
        expression === ""
          ? null
          : createCustomSqlExpression(activeDataSource, expression, name),
        scope === "GLOBAL" ? false : stateProps.shared,
        scope === "GLOBAL"
      )
    }
  }

  const applyCustomSQLMeasure = (
    expression: string,
    name: string,
    scope: "LOCAL" | "GLOBAL"
  ) => {
    if (isOldSelector) {
      // TODO: Destroy when old selectors are replaced
      dispatchProps.actions.oldSelectorSubmitMeasure(
        chartId,
        charts[chartId].type,
        selectorIndex,
        {
          value: expression,
          custom: true,
          isError: false,
          label: name || "Custom Measure",
          type: "CUSTOM"
        },
        layerId,
        scope === "GLOBAL" ? false : stateProps.shared,
        scope === "GLOBAL"
      )
      dispatchProps.actions.closeCustomSQLManager()
    } else {
      dispatchProps.actions.submitCustomSqlMeasure(
        chartId,
        layerId,
        selectorName,
        selectorIndex,
        expression === ""
          ? null
          : createCustomSqlExpression(activeDataSource, expression, name),
        scope === "GLOBAL" ? false : stateProps.shared,
        scope === "GLOBAL"
      )
    }
  }

  const applyCustomSQLPostFilter = (expression: string, name: string) => {
    if (isOldSelector) {
      // TODO: Destroy when old selectors are replaced
      dispatchProps.actions.oldSelectorSubmitPostFilter(
        chartId,
        charts[chartId].type,
        selectorIndex,
        {
          value: expression,
          custom: true,
          isError: false,
          label: name || "Custom Post Filter",
          type: "CUSTOM"
        },
        stateProps.shared
      )
      dispatchProps.actions.closeCustomSQLManager()
    }
  }

  const applyCustomSQLDefinitionEdit = async (
    expression: string,
    displayName: string
  ) => {
    if (stateProps.parameterDefinition.type === ParameterTypes.CUSTOM_FILTER) {
      try {
        await dispatchProps.actions.validateCustomSqlFilter(
          {
            dataSource: stateProps.parameterDefinition.source,
            sql: expression
          },
          chartId
        )
      } catch (e) {
        dispatchProps.actions.setCustomSqlFilterError(
          getErrorMessageFromBackendError(e)
        )
        return
      }
    }

    try {
      await dispatchProps.actions.simpleSetParameterValue(
        stateProps.parameterDefinition.name,
        expression
      )
    } catch (e) {
      dispatchProps.actions.setCustomSqlFilterError(
        getErrorMessageFromBackendError(e)
      )
      return
    }

    dispatchProps.actions.closeCustomSQLManager()

    // FIXME: Name changes don't trigger redraws
    await dispatchProps.actions.updateParameterDefinition({
      ...stateProps.parameterDefinition,
      displayName
    })
  }

  // We only prevent deleting custom SQL if it's in use in a different chart. If
  // it's in use for the chart that is being edited, scour it from all selectors
  // it may be used in first.
  const deleteCustomSQLDefinition = () => {
    dispatchProps.actions.closeCustomSQLManager()
    const parameterType = stateProps.parameterDefinition.type

    if (parameterType === ParameterTypes.CUSTOM_FILTER) {
      filtersUsingParameter.forEach((f) => {
        dispatchProps.actions.clearFilterByName(f.name)
      })
    } else if (chartId && selectorIndex !== undefined && isOldSelector) {
      dispatchProps.actions.removeSelector(chartId, {
        type: selectorType,
        index: selectorIndex
      })
    } else if (clearSelectorsOnDelete) {
      if (parameterType === ParameterTypes.CUSTOM_DIMENSION) {
        dispatchProps.actions.clearParameterizedCustomDimensionSelectors(
          chartId,
          `\${${parameterId}}`
        )
      } else if (parameterType === ParameterTypes.CUSTOM_MEASURE) {
        dispatchProps.actions.clearCustomMeasuresByValue(
          chartId,
          `\${${parameterId}}`
        )
      }
    }

    dispatchProps.actions.removeParameterDefinition(parameterId)
  }

  const deleteCustomSQLGlobalExpression = () => {
    dispatchProps.actions.closeCustomSQLManager()
    const parameterType = stateProps.parameterDefinition.type
    deleteGlobalExpressionsAsync(globalExpressionId)

    if (parameterType === ParameterTypes.CUSTOM_FILTER) {
      filtersUsingParameter.forEach((f) => {
        dispatchProps.actions.clearFilterByName(f.name)
      })
    } else if (chartId && selectorIndex !== undefined && isOldSelector) {
      dispatchProps.actions.removeSelector(chartId, {
        type: selectorType,
        index: selectorIndex
      })
    } else if (clearSelectorsOnDelete) {
      if (parameterType === ParameterTypes.GLOBAL_DIMENSION) {
        dispatchProps.actions.clearParameterizedCustomDimensionSelectors(
          chartId,
          `\${${stateProps.parameterDefinition.name}}`
        )
      } else if (parameterType === ParameterTypes.GLOBAL_MEASURE) {
        dispatchProps.actions.clearCustomMeasuresByValue(
          chartId,
          `\${${stateProps.parameterDefinition.name}}`
        )
      }
    }
    dispatchProps.actions.removeParameterDefinition(
      stateProps.parameterDefinition.name
    )
  }

  const applyCustomSQLGlobalEdit = async (
    expression: string,
    displayName: string
  ) => {
    if (stateProps.parameterDefinition.type === ParameterTypes.CUSTOM_FILTER) {
      try {
        await dispatchProps.actions.validateCustomSqlFilter(
          {
            dataSource: stateProps.parameterDefinition.source,
            sql: expression
          },
          chartId
        )
      } catch (e) {
        dispatchProps.actions.setCustomSqlFilterError(
          getErrorMessageFromBackendError(e)
        )
        return
      }
    }

    try {
      await updateGlobalExpressionAsync(globalExpressionId, expression)

      dispatchProps.actions.closeCustomSQLManager()

      await dispatchProps.actions.updateParameterDefinition({
        ...stateProps.parameterDefinition,
        displayName
      })

      await dispatchProps.actions.simpleSetParameterValue(
        stateProps.parameterDefinition.name,
        expression
      )
    } catch (e) {
      dispatchProps.actions.setCustomSqlFilterError(e.message)
    }
  }

  const APPLY_ACTIONS = {
    [CustomSQLTypes.CUSTOM_SQL_FILTER]: applyCustomSQLFilter,
    [CustomSQLTypes.CUSTOM_SQL_DIMENSION]: applyCustomSQLDimension,
    [CustomSQLTypes.CUSTOM_SQL_MEASURE]: applyCustomSQLMeasure,
    [CustomSQLTypes.CUSTOM_SQL_POST_FILTER]: applyCustomSQLPostFilter,
    [CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED]: applyCustomSQLDefinitionEdit,
    [CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL]: applyCustomSQLGlobalEdit
  }

  const DELETE_ACTIONS = {
    [CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED]: deleteCustomSQLDefinition,
    [CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL]: deleteCustomSQLGlobalExpression
  }

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    actions: {
      ...dispatchProps.actions,
      submitSQLExpression: APPLY_ACTIONS[customSQLType],
      deleteSQLExpression: DELETE_ACTIONS[customSQLType]
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CustomSQLManager)
