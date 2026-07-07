// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const defaultHandlerFilter = (existing, filteredValue) =>
  existing.responseKey !== filteredValue.responseKey

export const filterHandlers = (
  handlers,
  value,
  callback = defaultHandlerFilter
) => {
  return handlers.filter((h) => callback(h, value))
}
