// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import R from "ramda"

export const deserialize = R.compose(
  JSON.parse,
  window.decodeURIComponent,
  window.escape,
  window.atob
)
