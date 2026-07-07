// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { UserMetadata } from "components/settings/types"

const UsersListItem = ({ user: { username } }: { user: UserMetadata }) => {
  return (
    <tr className="users-settings__list__item">
      <td>{username}</td>
      {/* <td className={"users-settings__list__item__roles"}>*/}
      {/*  {roles.map((role) => (*/}
      {/*    <div key={role}>{role}</div>*/}
      {/*  ))}*/}
      {/* </td>*/}
    </tr>
  )
}

export default UsersListItem
