// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldKey } from "./field-types"

export const hasTextValue = (value: string | undefined) =>
  value !== undefined && value !== ""

// Returns error message for a required text field
export const getRequiredTextFieldError = (
  fieldKey: FieldKey,
  values: any,
  fieldLabel: string
): string =>
  hasTextValue(values[fieldKey]) ? "" : `${fieldLabel} cannot be empty`

// Returns error message for a required numeric field
export const getRequiredNumberError = (
  fieldKey: FieldKey,
  values: any,
  fieldLabel: string
): string => {
  const isEmptyError = getRequiredTextFieldError(fieldKey, values, fieldLabel)

  if (isEmptyError) {
    return isEmptyError
  }

  if (/^\d+$/.test(values[fieldKey])) {
    return ""
  }

  return `${fieldLabel} must be a number`
}

export const buildPostUrl = ({ host, port, protocol }) =>
  `${protocol}://${host}:${port}`
