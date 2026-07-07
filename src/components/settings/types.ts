// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type UserMetadata = {
  username: string
  roles: string[]
  firstName?: string
  lastName?: string
  email?: string
  title?: string
}

export type RoleMetadata = {
  name: string
}

export type Role = {
  name: string
}

export enum SETTINGS_PERMISSION {
  USER = "user",
  ADMIN = "admin"
}

export type SettingsState = {
  users: {
    loading: boolean
    metadata: UserMetadata[]
  }
  roles: {
    loading: boolean
    metadata: RoleMetadata[]
  }
}
