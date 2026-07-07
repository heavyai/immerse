// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const validateSixDigitHex = (hex: string) =>
  hex?.length === 7 && /^#[0-9A-F]{6}$/i.test(hex)

export const validateHex = (hex: string) =>
  validateSixDigitHex(hex) ||
  (hex.length === 4 && /^#([0-9A-F]{3}){1,2}$/i.test(hex))
