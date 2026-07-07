// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import SuccessIcon from "components/svg-icons/icon-success"

import "./cohort-snackbar.scss"

export const CohortSnackbar = ({ cohortApplied }) => (
  <div className="cohort-snackbar">
    <div className="cohort-snackbar-icon">
      <SuccessIcon />
    </div>
    <div className="text">
      <span className="title">Success!</span>
      <span>{`Cohort ${
        cohortApplied ? "applied" : "saved"
      } successfully`}</span>
    </div>
  </div>
)

CohortSnackbar.propTypes = {
  cohortApplied: PropTypes.bool
}

export default CohortSnackbar
