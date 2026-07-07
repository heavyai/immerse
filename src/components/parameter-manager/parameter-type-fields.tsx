// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { debounce, isEmpty } from "lodash"
import { connect, useSelector } from "react-redux"

import { TextField } from "widgets/text-field/TextField"
import { Tooltip } from "@rmwc/tooltip"
import { MultiSelect } from "widgets/multi-select/Multi-select"

import { isArrayColumn, isBoolType, isDictString } from "constants/data-types"
import { getParameterPropertyError } from "components/parameters/validation"
import { makeSelectGroupedOptions } from "selectors/data-sources"
import {
  getDistinctColumnValues,
  clearDistinctColumnValues
} from "actions/column-values-action-creators"
import { ParameterTypes } from "components/parameters/parameters-types"
import ColumnValueDropdown from "components/column-value-dropdown"
import { NUMBER_STEP_PRECISIONS } from "components/parameters/constants"
import { tabDisplayName } from "components/tabs/tabs-utils"
import { useColumnOptions } from "../../hooks/use-column-options"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { getFullColumnName } from "components/join-manager/utils"

const ValidationTooltip = ({
  parameter,
  showErrors,
  tooltip,
  property,
  propertyError,
  children
}) => {
  return (
    <Tooltip
      showArrow
      // Sometimes tooltip doesn't correctly clear when changing error states
      key={`${parameter.type}-${property}-${showErrors}`}
      content={(showErrors && propertyError) || tooltip}
      activateOn="focus"
      {...(showErrors ? { open: Boolean(propertyError) } : {})}
    >
      {children}
    </Tooltip>
  )
}

const ValidatedTextField = ({
  property,
  label,
  tooltip,
  parameter,
  setParameterProperties,
  showErrors,
  disabled,
  ...textFieldProps
}) => {
  const propertyError = getParameterPropertyError(parameter, property)

  return (
    <ValidationTooltip
      {...{ property, parameter, showErrors, tooltip, propertyError }}
    >
      <TextField
        autoComplete="off"
        label={label}
        disabled={disabled}
        invalid={showErrors && propertyError}
        value={parameter[property]}
        onChange={(e) =>
          setParameterProperties({ [property]: e.currentTarget.value })
        }
        onBlur={() =>
          setParameterProperties({
            [property]: (parameter[property] || "").trim()
          })
        }
        {...textFieldProps}
      />
    </ValidationTooltip>
  )
}

// XXX this is a placeholder component. We would want to stick in the custom expression editor here, if possible.
// ALSO - change TableParameterFields down below.
// XXX DELETE EVERYTHING BELOW ME TO NEXT TOKEN.
const ValidatedTextArea = ({
  property,
  label,
  tooltip,
  parameter,
  setParameterProperties,
  showErrors,
  disabled,
  ...textFieldProps
}) => {
  const propertyError = getParameterPropertyError(parameter, property)

  return (
    <ValidationTooltip
      {...{ property, parameter, showErrors, tooltip, propertyError }}
    >
      <TextField
        textarea
        outlined
        rows={15}
        autoComplete="off"
        label={label}
        disabled={disabled}
        invalid={showErrors && propertyError}
        value={parameter[property]}
        onChange={(e) =>
          setParameterProperties({ [property]: e.currentTarget.value })
        }
        onBlur={() =>
          setParameterProperties({
            [property]: (parameter[property] || "").trim()
          })
        }
        {...textFieldProps}
      />
    </ValidationTooltip>
  )
}
// XXX DELETE EVERYTHING ABOVE ME

const ValidatedSelect = ({
  options,
  property,
  label,
  tooltip,
  disabled,
  parameter,
  setParameterProperties,
  showErrors,
  getOptionTooltip = (option) => option.label,
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.value,
  ...selectFieldProps
}) => {
  const propertyError = getParameterPropertyError(parameter, property)

  const value = parameter[property]

  // Check if we have a join associated with the value
  const joinDataSource = useJoinFromParameter(value)
  const displayValue = joinDataSource?.name ?? value

  // This allows displaying the currently selected option before we've fetched the full options list.
  // (And prevents the accompanying jarring selection animation when said fetch returns.)
  const selectOptions = options.length ? options : value ? [value] : []

  const formatOptionLabel = (option) => {
    return (
      <Tooltip content={getOptionTooltip(option)}>
        <div>{getOptionLabel(option)}</div>
      </Tooltip>
    )
  }

  return (
    <ValidationTooltip
      {...{ property, parameter, showErrors, tooltip, propertyError }}
    >
      <MultiSelect
        blurInputOnSelect
        hasError={showErrors && propertyError}
        placeholder={label}
        options={selectOptions}
        value={
          parameter[property]
            ? {
                label: displayValue,
                value: parameter[property]
              }
            : label
        }
        onChange={(option) => {
          setParameterProperties({ [property]: getOptionValue(option) })
        }}
        formatOptionLabel={formatOptionLabel}
        isDisabled={disabled}
        {...selectFieldProps}
      />
    </ValidationTooltip>
  )
}

const TextParameterFields = (parameterProps) => (
  <ValidatedTextField
    {...parameterProps}
    property="defaultValue"
    label="Default Value"
    tooltip="Default value is required"
  />
)

// this also needs to be updated to insert the custom expression editor.
const TableParameterFields = (parameterProps) => (
  <ValidatedTextArea
    {...parameterProps}
    property="defaultValue"
    label="Default Value"
    tooltip="Default value is required"
  />
)

const NumberParameterFields = (parameterProps) => (
  <>
    <ValidatedTextField
      {...parameterProps}
      property="defaultValue"
      label="Default Value"
      tooltip="Default value is required"
    />

    <fieldset>
      <ValidatedTextField
        {...parameterProps}
        property="min"
        label="Min (Optional)"
        tooltip="Optional min for parameter value"
      />
      <ValidatedTextField
        {...parameterProps}
        property="max"
        label="Max (Optional)"
        tooltip="Optional max for parameter value"
      />
      <ValidatedSelect
        {...{
          ...parameterProps,
          options: Object.values(NUMBER_STEP_PRECISIONS)
            .sort((a, b) => (a < b ? 1 : -1))
            .map((precision) => ({
              label: precision,
              value:
                precision === NUMBER_STEP_PRECISIONS.AUTO
                  ? NUMBER_STEP_PRECISIONS.AUTO
                  : parseFloat(precision)
            })),
          property: "stepPrecision",
          label: "Slider Step Size",
          tooltip: "Increment size for slider"
        }}
      />
    </fieldset>
  </>
)

const SourceSelect = ({
  allDataSources,
  ...parameterProps
}: {
  allDataSources: DataSourceGroup[]
}) => {
  const joinDataSources = useSelector((state) => state.joinDataSources)
  return (
    <ValidatedSelect
      {...parameterProps}
      onChange={(option) =>
        parameterProps.setParameterProperties({
          source: option.value,
          column: "",
          defaultValue: ""
        })
      }
      disabled={!parameterProps.parameter.pending}
      options={makeSelectGroupedOptions(allDataSources, joinDataSources)}
      property="source"
      label="Source"
      tooltip={
        allDataSources.every((group) => isEmpty(group))
          ? "No data sources."
          : "Source is required"
      }
    />
  )
}

const ColumnParameterFields = ({
  allDataSources,
  columnsForSelectedSource = [],
  ...parameterProps
}: {
  allDataSources: DataSourceGroup[]
}) => {
  const {
    parameter: { source, pending, defaultValue }
  } = parameterProps

  const editOptions = useColumnOptions(source, { resetValue: defaultValue })
  const options = (pending ? columnsForSelectedSource : editOptions)
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(({ value, ...rest }) => ({ label: value, value, ...rest }))

  return (
    <fieldset>
      <SourceSelect allDataSources={allDataSources} {...parameterProps} />
      <ValidatedSelect
        {...{
          ...parameterProps,
          options,
          property: "defaultValue",
          label: "Default value",
          disabled: !source,
          tooltip: "Default column is required"
        }}
        getOptionTooltip={getFullColumnName}
        getOptionValue={getFullColumnName}
      />
    </fieldset>
  )
}

const CoordinateParameterFields = (parameterProps) => {
  const tabs = useSelector((state) => state.dashboard.tabs)

  return (
    <>
      <ValidatedTextField
        {...parameterProps}
        property="defaultValue"
        label="Default Value"
        tooltip="Default value is required"
        disabled={parameterProps.readOnly}
      />
      <ValidatedTextField
        {...parameterProps}
        property="parentChartId"
        label="Parent Chart ID"
        tooltip="Parent Chart ID is required"
        disabled={parameterProps.readOnly}
      />
      {parameterProps.readOnly ? (
        <TextField
          {...parameterProps}
          label="Parent Chart Page"
          value={
            parameterProps.parameter.parentChartTabId
              ? tabDisplayName(tabs[parameterProps.parameter.parentChartTabId])
              : undefined
          }
          disabled
        />
      ) : (
        <ValidatedTextField
          {...parameterProps}
          property="parentChartId"
          label="Parent Chart Tab"
          tooltip="Parent Chart ID is required"
          disabled={parameterProps.readOnly}
        />
      )}
      <ValidatedTextField
        {...parameterProps}
        property="shape"
        label="Shape Type"
        tooltip="Shape Type is required"
        disabled={parameterProps.readOnly}
      />
      <ValidatedTextField
        {...parameterProps}
        property="index"
        label="Index"
        tooltip="Index is required"
        disabled={parameterProps.readOnly}
      />
    </>
  )
}

// TODO: Move this into its own component and cleanup all the autosuggest
// features in our app
const mapStateToProps = (
  { columnValues },
  { parameter: { source, column } }
) => {
  const columnData = columnValues?.[source]?.[column] || {}

  return {
    autosuggestResults: columnData.distinctValues || []
  }
}

const mapDispatchToProps = (dispatch) => ({
  getAutosuggestResults: debounce((dataSource, column, searchTerm, limit) => {
    dispatch(
      getDistinctColumnValues({
        dataSource,
        column,
        searchTerm,
        limit,
        excludeNulls: true,
        ignoreAllFilters: true
      })
    )
  }, 200),
  clearAutosuggestResults: (dataSource, column) => {
    dispatch(clearDistinctColumnValues(dataSource, column))
  }
})

const ColumnValuesAutocomplete = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  ({
    autosuggestResults,
    getAutosuggestResults,
    clearAutosuggestResults,
    ...parameterProps
  }) => {
    const {
      parameter: { source, column, defaultValue },
      setParameterProperties
    } = parameterProps

    const sortedResults = autosuggestResults.map((result) => ({
      label: `${result.col}`,
      value: result.col
    }))

    const propertyError = getParameterPropertyError(
      parameterProps.parameter,
      "defaultValue"
    )

    return (
      <div className="column-values-autosuggest">
        <ValidationTooltip
          {...{
            ...parameterProps,
            propertyError,
            property: "defaultValue"
          }}
        >
          <ColumnValueDropdown
            value={defaultValue}
            setValue={(value) =>
              setParameterProperties({ defaultValue: `${value}` })
            }
            showReset={false}
            showErrors={parameterProps.showErrors && propertyError}
            options={sortedResults}
            label={"Default value"}
            queryForOptions={getAutosuggestResults}
            source={source}
            column={column}
            disabled={!source || !column}
            dropdownWidth={178}
          />
        </ValidationTooltip>
      </div>
    )
  }
)

const ColumnValueParameterFields = ({
  allDataSources,
  columnsForSelectedSource = [],
  ...parameterProps
}) => {
  const {
    setParameterProperties,
    parameter: { source, defaultValue, pending }
  } = parameterProps
  const editOptions = useColumnOptions(source, { resetValue: defaultValue })
  const options = (pending ? columnsForSelectedSource : editOptions)
    .filter(
      (column) =>
        (isDictString(column) || isBoolType(column.type)) &&
        !isArrayColumn(column)
    )
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(({ value, ...rest }) => ({ label: value, value, ...rest }))

  return (
    <fieldset>
      <SourceSelect allDataSources={allDataSources} {...parameterProps} />
      <ValidatedSelect
        {...parameterProps}
        onChange={(option) =>
          setParameterProperties({
            column: option.value,
            defaultValue: ""
          })
        }
        options={options}
        property="column"
        label="Column"
        disabled={!source || !pending}
        tooltip="Column is required"
        getOptionTooltip={getFullColumnName}
        getOptionValue={getFullColumnName}
      />
      <ColumnValuesAutocomplete {...parameterProps} />
    </fieldset>
  )
}

const getColumnDropdownOptions = (
  savedColumnMetadata,
  tablePreviewMetadata,
  source: string
) => {
  const savedMetadata = savedColumnMetadata[source]?.columnMetadata
  const previewMetadata =
    tablePreviewMetadata.tableName === source && !tablePreviewMetadata.error
      ? Object.keys(tablePreviewMetadata.fields).map((col) => ({
          ...tablePreviewMetadata.fields[col],
          value: tablePreviewMetadata.fields[col].name
        }))
      : []

  return savedMetadata || previewMetadata || []
}

export const getParameterTypeFields = ({
  allDataSources,
  savedColumnMetadata,
  tablePreviewMetadata,
  ...parameterProps
}) => {
  const columnsForSelectedSource = getColumnDropdownOptions(
    savedColumnMetadata,
    tablePreviewMetadata,
    parameterProps.parameter?.source
  )
  const PARAMETER_TYPE_FIELDS = {
    [ParameterTypes.TEXT]: <TextParameterFields {...parameterProps} />,
    [ParameterTypes.TABLE]: <TableParameterFields {...parameterProps} />,
    [ParameterTypes.NUMBER]: (
      <NumberParameterFields
        {...{
          ...parameterProps,
          parameter: {
            ...parameterProps.parameter,
            stepPrecision:
              parameterProps.parameter.stepPrecision ||
              NUMBER_STEP_PRECISIONS.AUTO
          }
        }}
      />
    ),
    [ParameterTypes.COLUMN]: (
      <ColumnParameterFields
        {...{ ...parameterProps, columnsForSelectedSource, allDataSources }}
      />
    ),
    [ParameterTypes.COLUMN_VALUE]: (
      <ColumnValueParameterFields
        {...{ ...parameterProps, columnsForSelectedSource, allDataSources }}
      />
    ),
    [ParameterTypes.COORDINATE]: (
      <CoordinateParameterFields {...parameterProps} />
    )
  }

  return PARAMETER_TYPE_FIELDS[
    parameterProps.parameter.type || ParameterTypes.TEXT
  ]
}
