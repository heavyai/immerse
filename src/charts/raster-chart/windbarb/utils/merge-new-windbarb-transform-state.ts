// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const mergeNewWindbarbTransformState = (prevTransform, newTransform) =>
  newTransform.length >= prevTransform.length
    ? newTransform.map((item, i) => ({
        ...(prevTransform[i] || {}),
        ...item
      }))
    : prevTransform.map((item, i) => ({
        ...(newTransform[i] || {}),
        ...item
      }))
