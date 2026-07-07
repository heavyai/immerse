// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import FEATUREFLAG_DEFINITIONS from "./featureflag-definitions.json"

// available_feature_flags is populated on its own so that it can be imported by
// tests that do not have access to a global `window` variable

export const available_feature_flags = {}

FEATUREFLAG_DEFINITIONS.forEach((flag) => {
  if (flag.constant) {
    available_feature_flags[flag.constant] = flag.key
  }
})
