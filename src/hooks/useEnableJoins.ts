// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { JOINS_ACCESS } from "constants/immerse-roles"
import { AppState } from "vega/charts/types"

export const useEnableJoins = () => {
  const roles = useSelector((state: AppState) => state.connection.roles)
  return (
    getFeatureFlag(available_feature_flags.ENABLE_JOINS) ||
    roles.includes(JOINS_ACCESS)
  )
}

export default useEnableJoins
