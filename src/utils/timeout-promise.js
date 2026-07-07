// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const timeoutPromise = (timeoutMessage, milliseconds) =>
  new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, milliseconds)
  })
