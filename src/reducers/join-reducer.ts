// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable consistent-return */
import {
  JOIN_DATA_SOURCE_CREATED,
  JOIN_DATA_SOURCE_UPDATED,
  JOIN_DATA_SOURCE_DELETED,
  JOIN_CREATED,
  JOIN_UPDATED,
  JOIN_DELETED
} from "components/join-manager/join-manager-actions"
import {
  Join,
  JoinDataSource
} from "components/join-manager/join-manager-types"
import { AnyAction } from "redux"
import { produce } from "immer"
import pushid from "pushid"

const initialState: JoinDataSource[] = []

export const joinDataSourcesReducer = produce(
  (state = initialState, action: AnyAction): JoinDataSource[] | void => {
    switch (action.type) {
      case JOIN_DATA_SOURCE_CREATED: {
        const newDataSource = action.joinDataSource
        newDataSource.id = newDataSource.id ?? pushid()
        // If this dataset comes with joins already in it, make sure they have ids
        if (newDataSource.joins?.length) {
          newDataSource.joins = newDataSource.joins.map((j: Join) =>
            j.id ? j : { ...j, id: pushid() }
          )
        }
        state.push(newDataSource)
        break
      }
      case JOIN_DATA_SOURCE_UPDATED: {
        const { updates, id } = action
        const joinDataSource = state.find((ds: JoinDataSource) => ds.id === id)
        Object.assign(joinDataSource, updates)
        break
      }
      case JOIN_DATA_SOURCE_DELETED: {
        return state.filter((ds: JoinDataSource) => ds.id !== action.id)
      }
      case JOIN_CREATED: {
        const { joinDataSourceId, join } = action
        const joinDataSource = state.find(
          (ds: JoinDataSource) => ds.id === joinDataSourceId
        )
        joinDataSource.joins.push({
          id: join.id ?? pushid(),
          ...join
        })
        break
      }
      case JOIN_UPDATED: {
        const { joinDataSourceId, joinId, updates } = action
        const joinDataSource = state.find(
          (ds: JoinDataSource) => ds.id === joinDataSourceId
        )
        const join = joinDataSource.joins.find((j: Join) => j.id === joinId)
        Object.assign(join, updates)
        break
      }
      case JOIN_DELETED: {
        const { joinDataSourceId, joinId } = action
        const joinDataSource = state.find(
          (ds: JoinDataSource) => ds.id === joinDataSourceId
        )
        joinDataSource.joins = joinDataSource.joins.filter(
          (j: Join) => j.id !== joinId
        )
        break
      }
      default:
        return state
    }
  }
)
