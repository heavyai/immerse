// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useRef, useState } from "react"
import ReactTestUtils from "react-dom/test-utils"
import { connect } from "react-redux"

import { CircularProgress } from "@rmwc/circular-progress"
import { TextField } from "widgets/text-field/TextField"

import { KEYCODE } from "constants/keycode"
import DataTable from "components/data-table/data-table"
import { DATA_TYPE_CATEGORY_TEXT } from "components/data-column-selector/constants"
import DataTypeIcon from "components/data-column-selector/data-type-icon"
import { getTypeCategory } from "components/data-column-selector/utils"
import { TypeCategory } from "components/data-column-selector/types"
import Popover from "components/popover/popover"

import { Column, CountOption } from "vega/constants/data-selection-types"
import { CustomSQLTypes } from "components/custom-sql-manager/custom-sql-manager-actions"
import { AppState } from "vega/charts/types"
import "./styles.scss"

const mapStateToProps = (state: AppState) => ({
  isSuperuser: state.connection.isSuperuser
})

type Option = Column | CountOption

type Props = {
  // Whether the component should be displayed as 'loading' with a spinner
  loading?: boolean

  // Whether the text input should be disabled for input
  disabled?: boolean

  // Options to choose from in the selector dropdown
  options: Option[] | null

  // Which option to highlight and display in the input when the dropdown is closed
  selectedOption?: Option

  // Which type category to restrict the options to (will filter 'options')
  typeCategory?: TypeCategory | null

  // Placeholder hint text to display in the input when there is no 'selectedOption'
  placeholder: string

  // Event handler called when a new option is selected in the dropdown
  updateValue: (v: Option) => void

  // indicates the selector is required for the chart or not
  required?: boolean

  // Event handler called when the input is manually cleared
  onClear?: () => void

  // Event handler called when the 'Create SQL filter' button is clicked
  onCreateCustomSql?: () => void

  onEditParameterizedCustomSql?: (
    existingCustomSql: Option,
    customSQLType: CustomSQLTypes
  ) => void

  // Label for Custom SQL button
  customSqlLabel?: string

  isSuperuser: boolean
}

const VegaSelector: FC<Props> = ({
  loading,
  disabled,
  selectedOption,
  options,
  typeCategory,
  updateValue,
  placeholder,
  required,
  onClear,
  onCreateCustomSql,
  onEditParameterizedCustomSql,
  customSqlLabel = "Create SQL dimension",
  isSuperuser
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [searchText, setSearchText] = useState("")

  const inputRef = useRef(null)
  const dataTableRef = useRef(null)

  if (options) {
    const searchFieldValue = isDropdownOpen
      ? searchText
      : selectedOption?.label || selectedOption?.value
    const searchCloseIcon = searchFieldValue
      ? {
          className: "close-icon",
          icon: "close",
          onClick: onClear
        }
      : null

    const displayedOptions = typeCategory
      ? options.filter(
          (option) => getTypeCategory(option.type) === typeCategory
        )
      : options

    const handleSearchChange = (event) => {
      setSearchText(event.currentTarget.value)
    }

    const handleSelectRow = (row) => {
      updateValue(row)
      setDropdownOpen(false)
      setSearchText("")

      // The input sometimes remains focused even after you've selected an option
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }

    const handleCloseDropdown = () => {
      setDropdownOpen(false)
      setSearchText("")
    }

    const handleOpenDropdown = () => {
      setSearchText("")
      setDropdownOpen(true)
    }

    const handleSubmit = (e) => {
      e.preventDefault()
    }

    const handleInputKeyDown = (e) => {
      // This is some black magic to trigger DataTable's keydown when a user
      // keys down in the search input. This is the result of DataTable being
      // separate from the search field.
      //
      // See this stackoverflow for why we're using ReactTestUtils.Simulate instead
      // of the native `dispatchEvent(new KeyboardEvent("keydown"))`
      // https://stackoverflow.com/questions/39065010/why-react-event-handler-is-not-called-on-dispatchevent
      ReactTestUtils.Simulate.keyDown(dataTableRef.current, {
        keyCode: e.keyCode
      })

      if (e.keyCode === KEYCODE.Esc) {
        e.currentTarget.blur()
      }
    }

    const handleDropdownMousedown = (e) => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        // This prevents blur on the search field if the user sorts or filters their data
        e.preventDefault()
        inputRef.current.focus()
      }
    }

    return (
      <div className="selector-main-section">
        {/* Ongoing attempts to force Chrome to not pop up autocomplete:
          https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
          https://stackoverflow.com/questions/37503656/react-doesnt-render-autocomplete-off
        */}
        <form autoComplete="new-password" onSubmit={handleSubmit}>
          <TextField
            disabled={disabled}
            inputRef={inputRef}
            className="selector-search-input"
            name="selector-search-input"
            label={`${placeholder}${required ? " *" : ""}`}
            placeholder={selectedOption?.label || selectedOption?.value}
            value={searchFieldValue || ""}
            onChange={handleSearchChange}
            onBlur={handleCloseDropdown}
            onFocus={handleOpenDropdown}
            onClick={handleOpenDropdown}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            trailingIcon={
              loading ? <CircularProgress /> : onClear ? searchCloseIcon : null
            }
          />
        </form>
        {isDropdownOpen && (
          <Popover isOpened onClose={handleCloseDropdown}>
            <div className="selector-column-dropdown">
              <DataTable
                loading={loading}
                data={displayedOptions}
                dataTableRef={dataTableRef}
                dataHeaders={[
                  {
                    columnHeader: "Column Name",
                    columnKey: "label"
                  },
                  {
                    columnHeader: "Type",
                    columnKey: "filterType",
                    alignEnd: true
                  }
                ]}
                filterText={searchText}
                filterTextColumnKey="label"
                filterCategoryColumnKey="filterType"
                getFilterCategory={getTypeCategory}
                getFilterCategoryLabel={(category) =>
                  DATA_TYPE_CATEGORY_TEXT[category]
                }
                getFilterCategoryIcon={(category) => (
                  <DataTypeIcon type={category} />
                )}
                activeRow={selectedOption}
                onSelectRow={handleSelectRow}
                onMouseDown={handleDropdownMousedown}
                callToAction={onCreateCustomSql}
                callToActionText={
                  // Allow modifying old custom SQL selectors here only
                  selectedOption?.isCustom &&
                  !(
                    selectedOption.sharedCustom || selectedOption.globalCustom
                  ) ? (
                    <>
                      Modify <em>{selectedOption?.value}</em>
                    </>
                  ) : (
                    `+ ${customSqlLabel}`
                  )
                }
                rowIconOptions={{
                  icon: "settings",
                  title: "Edit",
                  alignRight: true,
                  action: (row) =>
                    onEditParameterizedCustomSql(
                      row,
                      row.sharedCustom
                        ? CustomSQLTypes.CUSTOM_SQL_EDIT_SHARED
                        : CustomSQLTypes.CUSTOM_SQL_EDIT_GLOBAL
                    ),
                  isVisible: (option) =>
                    Boolean(
                      option.sharedCustom ||
                        (option.globalCustom && isSuperuser)
                    )
                }}
                useDefaultSort={false}
              />
            </div>
          </Popover>
        )}
      </div>
    )
  } else {
    return (
      <div className="selector-main-section">
        <TextField
          disabled
          className="selector-search-input"
          label={`${placeholder}${required ? " *" : ""}`}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps)(VegaSelector)
