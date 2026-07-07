// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// to prevent circular dependencies, if you need to directly access the redux store, import from here.
//
// import { importableStore as store } from "store/importableStore"
//
// and that's it. It's a drop in replacement, and prevents circles.

export let importableStore = {}

let savedStore = undefined

export function populateImportableStore(newStore) {
  importableStore = newStore
}

export function saveStore() {
  savedStore = importableStore
}

export function resetStore() {
  if (savedStore) {
    importableStore = savedStore
    savedStore = undefined
  }
}
