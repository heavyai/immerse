// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import DataTable from "components/data-table/data-table"
import { connect } from "react-redux"
import {
  getParameterDefinitions,
  makeGetParameterValue
} from "components/parameters/selectors"
import { isUserFacingParameter } from "components/parameters/parameters-types"

const mapStateToProps = (state) => {
  const parameters = getParameterDefinitions(state)
  const parametersForDataTable = {}
  Object.keys(parameters).forEach((name) => {
    if (isUserFacingParameter(parameters[name])) {
      parametersForDataTable[name] = {
        ...parameters[name],
        value: makeGetParameterValue(state)(name)
      }
    }
  })

  return { parameters: parametersForDataTable }
}

const ParametersDataTable = ({ parameters = {}, onSelectRow }) => {
  return (
    <DataTable
      data={Object.keys(parameters).map((name) => parameters[name])}
      dataHeaders={[
        {
          columnHeader: "Name",
          columnKey: "name"
        },
        {
          columnHeader: "Current Value",
          columnKey: "value"
        },
        {
          columnHeader: "Default",
          columnKey: "defaultValue"
        }
      ]}
      searchFieldLabel="Search parameters"
      filterTextColumnKey="name"
      onSelectRow={(parameter) => onSelectRow(`$\{${parameter.name}}`)}
      rowIconOptions={{
        icon: "input",
        style: {
          // Material's insert icon points right and there's no left-pointing
          // option, so flipping it with CSS
          transform: "scaleX(-1)"
        },
        title: "Copy To Custom SQL Section"
      }}
    />
  )
}

export default connect(mapStateToProps)(ParametersDataTable)
