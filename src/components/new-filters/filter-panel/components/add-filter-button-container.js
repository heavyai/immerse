// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import pushid from "pushid"

import { SecondaryButton } from "widgets/button/Button"
import { defaultFilter } from "components/custom-sql-manager/custom-sql-manager-utils"

const AddFilterButtonContainer = ({
  dataSource,
  setDashboardFilter,
  setFilterNewlyCreated
}) => {
  const addNewDashboardFilter = () => {
    const newName = pushid()
    setFilterNewlyCreated(newName)
    setDashboardFilter(
      // This creates a blank filter using datasource as the table
      // name, a table will get set when a column is selected
      defaultFilter(null, dataSource, null, null, null, {}),
      newName,
      undefined,
      undefined,
      false
    )
  }

  return (
    <div className="filter-button-container">
      <SecondaryButton
        className="filter-panel-button"
        icon={"add"}
        onClick={addNewDashboardFilter}
        data-testid="add-dashboard-filter-button"
      >
        <div>Add filter</div>
      </SecondaryButton>
    </div>
  )
}

AddFilterButtonContainer.propTypes = {
  dataSource: PropTypes.string
}

export default AddFilterButtonContainer
