// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const mapObject = (obj, value) =>
  Object.keys(obj).reduce(
    (result, key) => ({
      ...result,
      [key]: value
    }),
    {}
  )
