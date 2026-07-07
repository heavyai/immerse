// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const SHOW_DASHBOARD_MIGRATION_MODAL = "SHOW_DASHBOARD_MIGRATION_MODAL"
export const HIDE_DASHBOARD_MIGRATION_MODAL = "HIDE_DASHBOARD_MIGRATION_MODAL"

export const showDashboardMigrationModal = () => ({
  type: SHOW_DASHBOARD_MIGRATION_MODAL
})

export const hideDashboardMigrationModal = () => ({
  type: HIDE_DASHBOARD_MIGRATION_MODAL
})
