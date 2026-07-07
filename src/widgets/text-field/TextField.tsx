// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import * as RMWC from "@rmwc/types"
import { TextField as RMWCTextField } from "@rmwc/textfield"

import "./textField.scss"

/**
 * TextField properties.
 */
export interface ITextFieldProps {
  /** Sets the value for controlled TextFields. */
  value?: string | number
  /** Makes the TextField visually invalid. This is sometimes automatically applied in cases where required or pattern is used.  */
  invalid?: boolean
  /** Makes the Textfield disabled.  */
  disabled?: boolean
  /** Makes the Textfield required.  */
  required?: boolean
  /** Outline the TextField */
  outlined?: boolean
  /** A label for the input. */
  label?: React.ReactNode
  /** Makes a multiline TextField. */
  textarea?: boolean
  /** Makes the TextField fullwidth. */
  fullwidth?: boolean
  /** Add a leading icon. */
  icon?: RMWC.IconPropT
  /** Add a trailing icon. */
  trailingIcon?: RMWC.IconPropT
  /** The type of input field to render, search, number, etc */
  type?: string
  /** Number of rows to be shown **/
  rows?: number
  /** Maximum number of characters allowed in input **/
  maxLength?: number
  /** Adds a character count to the input field. Works with the maxLength prop **/
  characterCount?: boolean
  /** A callback that fires when the input blurs which takes an event with event.detail.value. */
  onChange?: (
    evt: RMWC.CustomEventT<{
      value: number
    }>
  ) => void
  /** A callback that fires continuously while the input is changed that takes an event with event.detail.value. */
  onInput?: (
    evt: RMWC.CustomEventT<{
      value: number
    }>
  ) => void
  onBlur?: (
    evt: RMWC.CustomEventT<{
      value: number
    }>
  ) => void
}

/**
 * TextField
 */
export const TextField = (props: ITextFieldProps) => (
  <RMWCTextField
    outlined={typeof props.outlined === "boolean" ? props.outlined : true}
    {...props}
  />
)

export default TextField
