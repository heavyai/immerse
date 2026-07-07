// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const UPDATE_TEXT = "UPDATE_TEXT"

export function updateText(text, id) {
  return {
    type: UPDATE_TEXT,
    text,
    id
  }
}
