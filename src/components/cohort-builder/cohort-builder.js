// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { isEmpty } from "lodash"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"

import { supportedIntegerTypesForCohort } from "constants/data-types"

import { getAllDataSources } from "components/custom-sql-manager/custom-sql-manager-utils"
import DataColumnSelector from "components/data-column-selector/data-column-selector"

import {
  createCohort,
  editCohort,
  hideCohortBuilderModal
} from "./cohort-builder-actions"

import "./cohort-builder.scss"

const CohortBuilder = ({ isEditingCohort, allDataSources, actions }) => {
  const [activeRow, setActiveRow] = useState({})

  let tableData = Object.keys(allDataSources).reduce((arr, key) => {
    if (allDataSources[key]) {
      const datasourceColumns = allDataSources[
        key
      ].columnMetadata.map((col) => ({ ...col, dataSource: key }))
      return [...arr, ...datasourceColumns]
    }
    return arr
  }, [])

  // If we're creating a cohort, cohorts only support certain data types
  // (no BIGINTs, etc), so filter those out. Also don't show other
  // cohorts as an option.
  if (!isEditingCohort) {
    tableData = tableData.filter(
      (row) => row.is_dict || supportedIntegerTypesForCohort(row.type)
    )
  }

  const dataHeaders = [
    {
      columnHeader: "Column Name",
      columnKey: "value"
    },
    {
      columnHeader: "Type",
      columnKey: "type"
    }
  ]

  // Include source column if there is more than one source on the dashboard
  if (Object.keys(allDataSources).length > 1) {
    dataHeaders.splice(1, 0, {
      columnHeader: "Source",
      columnKey: "table"
    })
  }

  return (
    <div className="cohort-builder" data-testid="cohort-builder">
      <SimpleDialog
        title={
          isEditingCohort
            ? "Change this Cohort's Dimension"
            : "Select a Dimension for Your Cohort"
        }
        footer={
          <>
            <SecondaryButton onClick={() => actions.hideCohortBuilderModal()}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              data-testid="cohort-builder-apply"
              onClick={() => {
                if (isEditingCohort) {
                  actions.editCohort(activeRow)
                } else {
                  actions.createCohort(activeRow)
                }
              }}
              disabled={isEmpty(activeRow)}
            >
              Apply
            </PrimaryButton>
          </>
        }
        open
        onClose={() => actions.hideCohortBuilderModal()}
        className="cohort-builder-modal"
      >
        <DataColumnSelector
          data={tableData}
          dataHeaders={dataHeaders}
          onSelectRow={setActiveRow}
          activeRow={activeRow}
        />
      </SimpleDialog>
    </div>
  )
}

function mapStateToProps(state) {
  const { isEditing } = state.ui.modal.cohortBuilderProps || {}

  return {
    allDataSources: getAllDataSources(state),
    isEditingCohort: isEditing
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      createCohort,
      editCohort,
      hideCohortBuilderModal
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(CohortBuilder)
