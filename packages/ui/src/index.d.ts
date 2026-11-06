// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode
  icon?: React.ReactNode | { icon: React.ReactNode; [key: string]: unknown }
  trailingIcon?:
    | React.ReactNode
    | { icon: React.ReactNode; [key: string]: unknown }
  variant?: "primary" | "secondary" | "quiet"
  tone?: "danger" | "warning" | "success"
}
export const Button: React.ForwardRefExoticComponent<
  IButtonProps & React.RefAttributes<HTMLButtonElement>
>
export const PrimaryButton: typeof Button
export const SecondaryButton: typeof Button
export const SecondaryButtonNoBorder: typeof Button
export const DangerButton: typeof Button
export const WarningButton: typeof Button
export const InfoButton: typeof Button
export const SuccessButton: typeof Button
export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode
  indeterminate?: boolean
}
export const Checkbox: React.ForwardRefExoticComponent<
  ToggleProps & React.RefAttributes<HTMLInputElement>
>
export const Switch: typeof Checkbox
export interface TooltipProps {
  asChild?: boolean
  content?: React.ReactNode
  children?: React.ReactNode
  enterDelay?: number
  open?: boolean
  align?: string
  showArrow?: boolean
  className?: string
}
export function Tooltip(props: TooltipProps): React.ReactElement
export function MenuSurfaceAnchor(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement
export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: (event: Event | React.SyntheticEvent) => void
  onSelect?: (event: React.MouseEvent) => void
  focusOnOpen?: boolean
  anchorCorner?: string
}
export function MenuSurface(props: MenuProps): React.ReactElement
export const Menu: typeof MenuSurface
export const MenuItem: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.RefAttributes<HTMLButtonElement>
>
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "danger" | "warning" | "success" | "info"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onOpen?: () => void
  onClose?: () => void
  preventOutsideDismiss?: boolean
  onOpenAutoFocus?: (event: Event) => void
}
export function Dialog(props: DialogProps): React.ReactElement
export const DialogTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLHeadingElement> &
    React.RefAttributes<HTMLHeadingElement>
>
export function DialogContent(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement
export function DialogActions(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement
export interface SliderProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "onChange" | "defaultValue"
  > {
  value?: number | number[]
  defaultValue?: number | number[]
  min?: number
  max?: number
  step?: number | null
  disabled?: boolean
  onChange?: (event: null, value: number | number[]) => void
  onChangeCommitted?: (event: null, value: number | number[]) => void
  getAriaLabel?: (index: number) => string
  getAriaValueText?: (value: number, index: number) => string
  valueLabelDisplay?: "auto" | "on" | "off"
  valueLabelFormat?: (value: number, index: number) => React.ReactNode
  track?: "normal" | "inverted" | false
}
export const Slider: React.ForwardRefExoticComponent<
  SliderProps & React.RefAttributes<HTMLSpanElement>
>
declare const primitives: {
  PrimaryButton: typeof PrimaryButton
  SecondaryButton: typeof SecondaryButton
  SecondaryButtonNoBorder: typeof SecondaryButtonNoBorder
  DangerButton: typeof DangerButton
  WarningButton: typeof WarningButton
  InfoButton: typeof InfoButton
  SuccessButton: typeof SuccessButton
}
export default primitives

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
  error?: boolean
  helperText?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  fullWidth?: boolean
  margin?: string
  variant?: string
  multiline?: boolean
}
export const TextField: React.ForwardRefExoticComponent<
  TextFieldProps & React.RefAttributes<HTMLInputElement>
>
export function InputLabel(
  props: React.LabelHTMLAttributes<HTMLLabelElement>
): React.ReactElement
export function Link(
  props: React.HTMLAttributes<HTMLElement> & {
    href?: string
    target?: string
    rel?: string
    component?: React.ElementType
  }
): React.ReactElement
export function Chip(
  props: React.HTMLAttributes<HTMLSpanElement> & {
    label: React.ReactNode
    size?: string
    color?: string
    variant?: string
  }
): React.ReactElement
export function CircularProgress(
  props: React.HTMLAttributes<HTMLSpanElement> & {
    size?: number
    value?: number
    variant?: string
  }
): React.ReactElement
export interface DateTimeFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  includeTime?: boolean
  value?: string
  label?: string
  onChange?: (value: string) => void
}
export const DateTimeField: React.ForwardRefExoticComponent<
  DateTimeFieldProps & React.RefAttributes<HTMLInputElement>
>
export function Select<Option = unknown, IsMulti extends boolean = false>(
  props: import("react-select").Props<Option, IsMulti>
): React.ReactElement
export function CreatableSelect<
  Option = unknown,
  IsMulti extends boolean = false
>(
  props: import("react-select/creatable").CreatableProps<
    Option,
    IsMulti,
    import("react-select").GroupBase<Option>
  >
): React.ReactElement
export function FileDrop(props: {
  onFile: (file: File) => void | (() => void)
  accept?: string
  label?: string
  children?: React.ReactNode
  className?: string
}): React.ReactElement
