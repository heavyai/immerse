// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import AutoSuggest from "react-autosuggest"
import cx from "classnames"
import { dashboardSharingUserShape } from "constants/prop-types"
import { difference, reduce, T as alwaysTrue } from "ramda"
import IconSearch from "components/svg-icons/icon-search"

AddUserOrRoleForm.propTypes = {
  allUsersAndRoles: PropTypes.arrayOf(dashboardSharingUserShape),
  sharedUsersList: PropTypes.arrayOf(dashboardSharingUserShape),
  suggestions: PropTypes.arrayOf(dashboardSharingUserShape),
  autosuggestValue: PropTypes.string,
  addDashboardSharedUser: PropTypes.func,
  updateDashboardAutosuggestValue: PropTypes.func,
  updateDashboardShareSuggestions: PropTypes.func
}

// enables a user of Immerse to search for and select users or roles
function AddUserOrRoleForm({
  allUsersAndRoles,
  sharedUsersList,
  suggestions,
  autosuggestValue,
  addDashboardSharedUser,
  updateDashboardAutosuggestValue,
  updateDashboardShareSuggestions
}) {
  // how user or role properties are rendered in a suggestion list item
  const renderSuggestion = (suggestion) => (
    <span
      className={cx({
        "suggested-role": suggestion.type === "ROLE",
        "suggested-user": suggestion.type === "USER"
      })}
    >
      {suggestion.id}
    </span>
  )

  // how sub-headings are rendered in the dropdown
  const renderSectionTitle = (section) => <span>{section.title}</span>

  // capture input element ref so we can manually blur it on select
  let inputRef = null
  const captureRef = (ref) => {
    if (ref) {
      inputRef = ref
    }
  }

  // how the AutoSuggest input is rendered
  const renderInputComponent = (inputProps) => (
    <div className="react-autosuggest__inputContainer">
      <input
        {...inputProps}
        id="dashboard-share-add-users-input"
        placeholder="Search to add roles and users…"
        ref={captureRef}
      />
      <IconSearch className="icon-search" />
    </div>
  )

  // fired when a user selects a list item via keyboard enter or mouse click
  const onSuggestionSelected = (event, { suggestion }) => {
    addDashboardSharedUser(suggestion)
    updateDashboardAutosuggestValue("")
    updateDashboardShareSuggestions([])
    if (inputRef) {
      inputRef.blur()
    }
  }

  // what property to match on for suggestions
  const getSuggestionValue = (suggestion) => suggestion.id

  // data shape needed by react-autosuggest to show sub-headings for suggestions in the dropdown
  const suggestionsShape = [
    {
      title: "Roles",
      suggestions: []
    },
    {
      title: "Users",
      suggestions: []
    }
  ]

  // how to group users and roles into suggestion shape
  function group(acc, cur) {
    const type = cur.type
    if (type === "ROLE") {
      acc[0].suggestions.push(cur)
    } else {
      acc[1].suggestions.push(cur)
    }
    return acc
  }

  // creates the data shape used by react-autosuggest
  const options = reduce(
    group,
    suggestionsShape
  )(
    // no need to show users or roles that have already been selected...
    difference(allUsersAndRoles, sharedUsersList)
  )

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  const escapeRegexCharacters = (str) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // how to match what the user enters with available users and roles
  const getSuggestions = (value) => {
    const escapedValue = escapeRegexCharacters(value.trim())
    const regex = new RegExp(`^${escapedValue}`, "i")
    return options
      .map((section) => ({
        title: section.title,
        suggestions: section.suggestions.filter((suggestion) =>
          regex.test(suggestion.id)
        )
      }))
      .filter((section) => section.suggestions.length > 0)
  }

  // how autosugguest accesses suggestion list for each section in suggestionsShape
  const getSectionSuggestions = (section) => section.suggestions

  // handles updating the suggestions list in the dropdown
  const onSuggestionsFetchRequested = ({ value }) => {
    updateDashboardShareSuggestions(getSuggestions(value))
  }

  // clears the suggestions list in the dropdown
  const onSuggestionsClearRequested = () => {
    updateDashboardShareSuggestions([])
  }

  // pass the autosuggest's input value to redux
  const onChange = (event, { newValue }) => {
    updateDashboardAutosuggestValue(newValue)
  }

  // props specific to the autosuggest input
  const autosuggestInputProps = {
    value: autosuggestValue,
    onChange
  }

  return (
    <div className="dashboard-share-modal--add-users-or-roles-form">
      <AutoSuggest
        highlightFirstSuggestion
        multiSection
        focusInputOnSuggestionClick={false}
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        renderSuggestion={renderSuggestion}
        renderSectionTitle={renderSectionTitle}
        renderInputComponent={renderInputComponent}
        getSuggestionValue={getSuggestionValue}
        getSectionSuggestions={getSectionSuggestions}
        shouldRenderSuggestions={alwaysTrue}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={autosuggestInputProps}
      />
    </div>
  )
}

export default AddUserOrRoleForm
