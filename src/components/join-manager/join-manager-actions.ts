// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  JoinCreate,
  JoinDataSource,
  JoinDataSourceCreate,
  JoinDataSourceUpdate,
  JoinUpdate
} from "./join-manager-types"

export const OPEN_JOIN_MANAGER = "OPEN_JOIN_MANAGER"
export const CLOSE_JOIN_MANAGER = "CLOSE_JOIN_MANAGER"

export const JOIN_DATA_SOURCE_CREATED = "JOIN_DATA_SOURCE_CREATED"
export const JOIN_DATA_SOURCE_UPDATED = "JOIN_DATA_SOURCE_UPDATED"
export const JOIN_DATA_SOURCE_DELETED = "JOIN_DATA_SOURCE_DELETED"

export const JOIN_CREATED = "JOIN_CREATED"
export const JOIN_UPDATED = "JOIN_UPDATED"
export const JOIN_DELETED = "JOIN_DELETED"

export const openJoinManager = ({
  chartId,
  layerId,
  joinDefinition
}: {
  chartId?: string
  layerId?: string
  joinDefinition?: JoinDataSource
}) => ({
  type: OPEN_JOIN_MANAGER,
  joinManagerProps: {
    joinDefinition,
    chartId,
    layerId
  }
})

export const closeJoinManager = () => ({
  type: CLOSE_JOIN_MANAGER
})

export const joinDataSourceCreated = (
  joinDataSource: JoinDataSourceCreate
) => ({
  type: JOIN_DATA_SOURCE_CREATED,
  joinDataSource
})

export const joinDataSourceUpdated = (
  id: string,
  updates: JoinDataSourceUpdate
) => ({
  type: JOIN_DATA_SOURCE_UPDATED,
  id,
  updates
})

export const joinDataSourceDeleted = (id: string) => ({
  type: JOIN_DATA_SOURCE_DELETED,
  id
})

export const joinCreated = (joinDataSourceId: string, join: JoinCreate) => ({
  type: JOIN_CREATED,
  join,
  joinDataSourceId
})

export const joinUpdated = (
  joinDataSourceId: string,
  joinId: string,
  updates: JoinUpdate
) => ({
  type: JOIN_UPDATED,
  updates,
  joinDataSourceId,
  joinId
})

export const joinDeleted = (joinDataSourceId: string, joinId: string) => ({
  type: JOIN_DELETED,
  joinDataSourceId,
  joinId
})
