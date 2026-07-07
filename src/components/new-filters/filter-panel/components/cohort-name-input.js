// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import PropTypes from "prop-types"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { TextField } from "widgets/text-field/TextField"
import { Switch } from "widgets/switch/Switch"
import InfoIcon from "components/svg-icons/info"
import { Tooltip } from "@rmwc/tooltip"

import "./cohort-name-input.scss"

export const CohortNameInput = ({ cohorts, onApplyCohort }) => {
  const REPLACE_FILTER_SET = "Save and apply to current filter set"
  const CREATE_FILTER_SET = "Save and apply to new filter set"
  const ERROR_NAME_EMPTY = "Please enter a name for your cohort."
  const ERROR_NAME_DUPLICATED =
    "This name already exists. \nPlease choose a new name for your cohort."

  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [replace, setReplace] = useState(false)

  const nameDuplicated = () =>
    Object.values(cohorts).some((cohort) => cohort.name === name)

  const getError = () => {
    if (!name) {
      return ERROR_NAME_EMPTY
    } else if (nameDuplicated()) {
      return ERROR_NAME_DUPLICATED
    }
    return ""
  }

  const onSubmit = (apply) => {
    const errorText = getError()
    if (errorText) {
      setError(errorText)
    } else if (apply) {
      onApplyCohort(name, !replace, replace)
    } else {
      onApplyCohort(name, false, false)
      setName("")
    }
  }

  const onKeyUp = (e) => {
    if (e.key === "Enter") {
      onSubmit(true)
    }
  }

  return (
    <div className="cohort-name-input-container">
      <div className="cohort-name-body">
        <span className="cohort-name-header">Save and Apply Cohort</span>
        <Tooltip content={error} open={error} showArrow>
          <TextField
            className="cohort-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError("")
            }}
            onKeyUp={onKeyUp}
            autoFocus
            label="Name your Cohort"
            invalid={error}
            data-testid="cohort-name-modal-input"
          />
        </Tooltip>
        <Switch
          label="Apply Cohort to Current Filter Set"
          checked={replace}
          onChange={(e) => {
            setReplace(e.currentTarget.checked)
          }}
          data-testid="cohort-name-modal-checkbox"
        />
        <div className={`warning ${replace ? "visible" : ""}`}>
          <InfoIcon />
          Removes existing filters
        </div>
      </div>
      <div className="cohort-name-footer">
        <SecondaryButton
          className="cohort-name-footer-save-only"
          disabled={error}
          data-testid="cohort-name-save"
          onClick={() => onSubmit(false)}
        >
          Save only
        </SecondaryButton>
        <PrimaryButton
          className="cohort-name-footer-save-apply"
          onClick={() => onSubmit(true)}
          disabled={error}
          data-testid="cohort-name-modal-save-apply"
        >
          {replace ? REPLACE_FILTER_SET : CREATE_FILTER_SET}
        </PrimaryButton>
      </div>
    </div>
  )
}

CohortNameInput.propTypes = {
  onApplyCohort: PropTypes.func,
  dataSource: PropTypes.string,
  cohorts: PropTypes.object
}

export default CohortNameInput
