// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSelector } from "reselect"

export const getConnection = (state) => state.connection

export const getSessionInfo = createSelector(
  [getConnection],
  (connection = {}) => connection.sessionInfo
)

export const getDatabase = createSelector(
  [getSessionInfo],
  (sessionInfo = {}) => (sessionInfo || {}).database
)
