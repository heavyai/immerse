// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Application composition boundary for callers that still live outside React.
// Filter utilities themselves receive explicit snapshots and cannot read a store.

let store = {}

export const bindLegacyApplicationStore = (applicationStore) => {
  store = applicationStore
}

export const getStore = () => store
