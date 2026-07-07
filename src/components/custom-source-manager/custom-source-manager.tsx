// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useRef, useEffect } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { isEmpty } from "lodash"

import { SimpleDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"
import { CircularProgress } from "@rmwc/circular-progress"

import { setCustomSqlFilterError } from "components/new-filters/filters-actions"
import { sourceNameRegex } from "components/parameters/validation"
import { makeGetParametersOfType } from "components/parameters/selectors"
import { ParameterTypes } from "components/parameters/parameters-types"
import { PENDING_PARAMETER_PROPERTIES } from "components/parameter-manager/constants"
import CustomSQLSideBrowser from "components/custom-sql-side-browser/custom-sql-side-browser"
import {
  submitCustomSource,
  closeCustomSourceManager
} from "components/custom-source-manager/custom-source-manager-actions"
import { loadTableFunctions } from "actions/backend-functions-action-creators"

import "./custom-source-manager.scss"

const CustomSourceManager = ({
  actions,
  activeDataSource,
  chartId,
  layerId,
  customSQLError,
  customSource,
  customSources
}) => {
  const [showSourceNameError, setShowSourceNameError] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [sourceName, setSourceName] = useState(customSource.name || "")
  const [expression, setExpression] = useState(customSource.defaultValue || "")

  const refTextArea = useRef()

  useEffect(() => {
    actions.loadTableFunctions()
  }, [actions])

  useEffect(() => {
    setSourceName(customSource.name || "")
  }, [customSource.name])

  useEffect(() => {
    setExpression(customSource.defaultValue || "")
  }, [customSource.defaultValue])

  useEffect(() => {
    setShowLoading(false)
  }, [customSQLError])

  const insertValueIntoExpression = (value) => {
    const cursorPosition = refTextArea.current.selectionStart

    setExpression(
      (currentExpression) =>
        `${currentExpression.slice(
          0,
          cursorPosition
        )}${value}${currentExpression.slice(cursorPosition)}`
    )
  }

  const submitSQL = () => {
    try {
      const newCustomSource = {
        ...PENDING_PARAMETER_PROPERTIES,
        type: ParameterTypes.TABLE,
        name: sourceName,
        defaultValue: expression
      }
      delete newCustomSource.pending

      actions.submitCustomSource(chartId, layerId, newCustomSource)
    } catch (e) {
      actions.setCustomSQLError(e.message)
    }
  }

  const validateSQL = () => {
    setShowLoading(false)
    setShowSourceNameError(false)

    if (
      !(sourceName && sourceName.match(sourceNameRegex)) ||
      customSources.includes(sourceName)
    ) {
      setShowSourceNameError(true)
    } else if (!customSQLError) {
      setShowLoading(true)
      submitSQL()
    }
  }

  return (
    <SimpleDialog
      title="Custom Source Editor"
      footer={
        <>
          <SecondaryButton onClick={actions.closeCustomSourceManager}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={validateSQL}
            className="custom-source-manager__submit"
            disabled={
              isEmpty(expression) ||
              isEmpty(sourceName) ||
              showLoading ||
              customSQLError ||
              showSourceNameError
            }
            data-testid="custom-source-manager-apply"
          >
            {showLoading ? <CircularProgress /> : "Create custom source"}
          </PrimaryButton>
        </>
      }
      open
      onClose={actions.closeCustomSourceManager}
      className="custom-source-manager"
    >
      <div className="custom-source-manager__layout">
        <div className="custom-source-manager__editor">
          <div className="custom-source-manager__name">
            <Tooltip
              showArrow
              content={
                <>
                  Source names should be unique and can contain
                  <br />
                  alphanumeric characters or underscores
                </>
              }
              open={showSourceNameError}
            >
              <TextField
                autoFocus
                maxLength={50}
                onChange={(e) => {
                  setShowSourceNameError(false)
                  setSourceName(e.currentTarget.value)
                }}
                label="Source Name *"
                value={sourceName}
                invalid={showSourceNameError}
              />
            </Tooltip>
          </div>
          <textarea
            ref={refTextArea}
            className="custom-source-manager__expression"
            placeholder="Enter SQL statement"
            onChange={(e) => {
              if (customSQLError) {
                actions.setCustomSQLError("")
              }

              setExpression(e.currentTarget.value)
            }}
            value={expression}
            data-testid="custom-source-manager-expression"
          />
          {customSQLError && (
            <div className="custom-source-manager__error">{customSQLError}</div>
          )}
        </div>
        <CustomSQLSideBrowser
          activeDataSource={activeDataSource}
          onSelectRow={insertValueIntoExpression}
          showDataSourceTransforms
        />
      </div>
    </SimpleDialog>
  )
}

const mapStateToProps = (state) => {
  const {
    ui: {
      customSQLFilterError,
      customSourceManagerProps: {
        activeDataSource,
        chartId,
        layerId,
        customSource
      }
    }
  } = state

  return {
    activeDataSource,
    chartId,
    customSource,
    layerId,
    customSQLError: customSQLFilterError,
    customSources: makeGetParametersOfType(state)(ParameterTypes.TABLE)
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadTableFunctions,
      closeCustomSourceManager,
      submitCustomSource,
      setCustomSQLError: setCustomSqlFilterError
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomSourceManager)
