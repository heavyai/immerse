// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
export interface IButtonProps {
  disabled?: boolean
  label?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode | { icon: React.ReactNode; [key: string]: unknown }
  trailingIcon?: React.ReactNode | { icon: React.ReactNode; [key: string]: unknown }
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}
export function PrimaryButton(props: IButtonProps): React.ReactElement
export function SecondaryButton(props: IButtonProps): React.ReactElement
export function SecondaryButtonNoBorder(props: IButtonProps): React.ReactElement
export function DangerButton(props: IButtonProps): React.ReactElement
export function WarningButton(props: IButtonProps): React.ReactElement
export function InfoButton(props: IButtonProps): React.ReactElement
export function SuccessButton(props: IButtonProps): React.ReactElement

declare const buttons: { PrimaryButton: typeof PrimaryButton; SecondaryButton: typeof SecondaryButton; SecondaryButtonNoBorder: typeof SecondaryButtonNoBorder; DangerButton: typeof DangerButton; WarningButton: typeof WarningButton; InfoButton: typeof InfoButton; SuccessButton: typeof SuccessButton }
export default buttons
