// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  TOGGLE_HELP_MENU,
  TOGGLE_USER_MENU,
  TOGGLE_DOCS_MENU,
  SHOW_UNSAVED_CHANGES_DIALOG
} from "constants/action-types"

export const initialState = {
  helpMenuOpen: false,
  userMenuOpen: false,
  docsMenuOpen: false,
  showUnsavedChangesDialog: false
}

export default function NavBarReducer(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_HELP_MENU:
      return Object.assign({}, state, {
        helpMenuOpen: action.status === "closed" ? false : !state.helpMenuOpen
      })
    case TOGGLE_USER_MENU:
      return Object.assign({}, state, {
        userMenuOpen: action.status === "closed" ? false : !state.userMenuOpen
      })
    case TOGGLE_DOCS_MENU:
      return Object.assign({}, state, {
        docsMenuOpen: action.status === "closed" ? false : !state.docsMenuOpen
      })
    case SHOW_UNSAVED_CHANGES_DIALOG:
      return Object.assign({}, state, {
        showUnsavedChangesDialog: action.visible
      })
    default:
      return state
  }
}
