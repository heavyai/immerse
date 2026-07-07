// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchableList } from "hooks/useSearchableList"
import { TextField } from "widgets/text-field/TextField"
import { getUsersMetadata } from "actions/settings-action-creators"
import { SettingsState, UserMetadata } from "components/settings/types"
import UserListItem from "./users-list-item"

import "./styles.scss"

const UsersSettings = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getUsersMetadata())
  }, [dispatch])

  const users = useSelector(
    (state: { settings: SettingsState }) => state.settings.users.metadata
  )

  const {
    filteredList: filteredUsers,
    setSearchTerm,
    searchTerm
  } = useSearchableList(users, ["username", "roles"])

  return (
    <div className="users-settings">
      <header className="settings__content__header">
        <h1>Users</h1>
        <p>View users within your HEAVY.AI platform.</p>
      </header>

      <TextField
        className="users-settings__search-input"
        data-testid="users-search-input"
        icon="search"
        placeholder="Search users"
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />
      <table>
        <tr>
          <th>Username</th>
          {/* <th>Role</th>*/}
        </tr>

        {filteredUsers.map((user: UserMetadata) => (
          <UserListItem user={user} key={user.username} />
        ))}
      </table>
    </div>
  )
}

export default UsersSettings
