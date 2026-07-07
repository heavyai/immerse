// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

// All users can edit dashboards unless the RESTRICTED_VIEWING FF is on,
// in which case they need `editDashboard` permissions
export const userCanEditDashboard = (privileges) =>
  !getFeatureFlag(available_feature_flags.RESTRICTED_VIEWING) ||
  privileges.editDashboard
