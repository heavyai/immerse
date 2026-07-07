// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Role } from "components/settings/types"
import RolesNoResults from "./roles-no-results"

const RolesList = ({
  roles,
  searchTerm
}: {
  roles: Role[]
  searchTerm: string
}) => {
  if (roles.length === 0 && Boolean(searchTerm)) {
    return <RolesNoResults />
  } else {
    return (
      <table>
        <tbody>
          <tr>
            <th>Roles</th>
          </tr>
          {roles.map((role) => (
            <tr key={role.name}>
              <td>{role.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

export default RolesList
