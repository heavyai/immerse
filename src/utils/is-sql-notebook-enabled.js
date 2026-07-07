// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { ENABLE_NOTEBOOK_UI_SQL_EDITOR } = available_feature_flags

export const isSqlNotebookEnabled = () =>
  getFeatureFlag(ENABLE_NOTEBOOK_UI_SQL_EDITOR)
