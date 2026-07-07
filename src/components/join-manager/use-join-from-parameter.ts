// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parametersInValue } from "components/parameters/utils"
import { useSelector } from "react-redux"
import { AppState } from "vega/charts/types"
import { JoinDataSource } from "./join-manager-types"
import { hasParamSyntax } from "utils/parameters"

export function useJoinFromParameter(
  parameterId: string
): JoinDataSource | undefined {
  return useSelector<AppState, JoinDataSource | undefined>((state) => {
    return findJoinDataSourceForParameter(parameterId, state.joinDataSources)
  })
}

export function findJoinDataSourceForParameter(
  parameterId: string,
  joinDataSources: JoinDataSource[] | undefined
) {
  // If a user of the hooks passes in the full parameter syntax, parse it out to just get the param name
  const paramId = hasParamSyntax(parameterId)
    ? parametersInValue(parameterId)?.[0]
    : parameterId
  // jds.parameter is _only_ the name, not param syntax
  return joinDataSources?.find(
    (jds: JoinDataSource) => jds.parameter === paramId
  )
}
