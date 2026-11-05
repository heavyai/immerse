// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { push } from "services/navigation"

export function navigate(route) {
  return (dispatch) => dispatch(push(route))
}
