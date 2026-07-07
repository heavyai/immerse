// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const unsavedWrapDatabaseChangeHandler = ({
  next,
  actions,
  unsavedDashboard
}) => {
  const onDbChange = () => {
    actions.toggleUserMenu()
    return next()
  }
  if (unsavedDashboard) {
    return actions.discardUnsavedDashboardChanges(onDbChange)
  } else {
    return onDbChange()
  }
}

export const unsavedLogoutClickHandler = (
  { actions, unsavedDashboard, canEditDashboard },
  cb = () => {}
) => {
  const onLogout = () => {
    actions.disconnect()
    actions.toggleUserMenu()
    cb()
  }
  if (unsavedDashboard && canEditDashboard) {
    actions.discardUnsavedDashboardChanges(onLogout)
  } else {
    onLogout()
  }
}
