// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { getRolesMetadata } from "actions/settings-action-creators"
import { useSearchableList } from "hooks/useSearchableList"
import { TextField } from "widgets/text-field/TextField"
import { SettingsState } from "components/settings/types"

import RolesList from "./roles-list"
import "./styles.scss"

const RolesSettings = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getRolesMetadata())
  }, [dispatch])

  const roles = useSelector(
    (state: { settings: SettingsState }) => state.settings.roles.metadata
  )

  const {
    filteredList: filteredRoles,
    setSearchTerm,
    searchTerm
  } = useSearchableList(roles, ["name"])

  return (
    <div className="settings__content__main roles-settings">
      <header className="settings__content__header">
        <h1>Roles</h1>
        <p>View current roles being used within your ecosystem.</p>
      </header>
      <TextField
        className="roles-settings__search-input"
        data-testid="roles-search-input"
        icon="search"
        placeholder="Search by role"
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />
      <div className="roles-settings__roles-list">
        <RolesList roles={filteredRoles} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
export default RolesSettings
