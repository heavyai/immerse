// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FunctionComponent } from "react"
import classNames from "classnames"
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@rmwc/dialog"
import { IconButton } from "widgets/icon-button/Icon-button"
import { Icon } from "@rmwc/icon"
import {
  DangerButton,
  WarningButton,
  SuccessButton,
  SecondaryButton,
  PrimaryButton
} from "../button/Button"

import "./dialog.scss"

/**
 * Dialog properties.
 */
export interface ISimpleDialogProps {
  /** Whether or not the Dialog is showing. */
  open?: boolean
  /** Callback for when the Dialog opens. */
  onOpen?: any
  /** Callback for when the Dialog closes. */
  onClose?: any
  title?: React.ReactNode | string
  message?: React.ReactNode | string
  primaryLabel?: React.ReactNode | string
  secondaryLabel?: React.ReactNode | string
  primaryAction?(): void
  secondaryAction?(): void
  type?: string
  hideCloseIcon?: boolean
  onCloseFromHeader?: any
  children?: React.ReactNode
  footer?: React.ReactNode
  prependFooter?: React.ReactNode
  className?: any
  onStateChange?: any
  preventOutsideDismiss?: any
  primaryDisabled?: boolean
}

export interface IDialogProps {
  /** Whether or not the Dialog is showing. */
  open?: boolean
  /** Callback for when the Dialog opens. */
  onOpen?: any
  /** Callback for when the Dialog closes. */
  onClose?: any
  children?: React.ReactNode
}

/**
 * Dialog
 */
export const SimpleDialog: FunctionComponent<ISimpleDialogProps> = ({
  primaryLabel = "Ok",
  secondaryLabel = "Cancel",
  primaryAction,
  secondaryAction,
  message,
  onClose = () => {},
  onOpen = () => {},
  title,
  open,
  type,
  hideCloseIcon,
  onCloseFromHeader,
  children,
  footer,
  prependFooter,
  className,
  onStateChange,
  preventOutsideDismiss,
  primaryDisabled = false
}) => {
  const handlePrimary = () => {
    if (primaryAction) {
      primaryAction()
    }
    onClose()
  }

  const handleSecondary = () => {
    if (secondaryAction) {
      secondaryAction()
    }
    onClose()
  }

  /* eslint-disable no-confusing-arrow */
  const handleCloseFromHeader = () =>
    onCloseFromHeader ? onCloseFromHeader() : onClose("from header")

  return (
    <Dialog
      className={classNames(type, className)}
      open={open}
      onOpen={onOpen}
      onStateChange={(e) => {
        if (onStateChange) {
          onStateChange(e)
        }
        if (open && e === "closing") {
          onClose("from state change")
        }
      }}
      preventOutsideDismiss={preventOutsideDismiss}
      data-testid="simple-dialog"
    >
      {(title || !hideCloseIcon) && (
        <DialogTitle>
          {title}
          {!hideCloseIcon && (
            <IconButton
              icon="close"
              onClick={handleCloseFromHeader}
              ripple={false}
            />
          )}
        </DialogTitle>
      )}
      <DialogContent>
        {children ? (
          children
        ) : (
          <>
            <div className="message-icon">
              {(type === "warning" || type === "danger") && (
                <Icon icon="warning_outline" />
              )}
              {type === "success" && <Icon icon="check_circle_outline" />}
              {type === "info" && <Icon icon="info_outline" />}
            </div>
            <div className="dialog-message">
              {Array.isArray(message)
                ? message.map((msg, i) => <p key={i}>{msg}</p>)
                : message}
            </div>
          </>
        )}
      </DialogContent>
      {(footer || primaryAction || secondaryAction) && (
        <DialogActions>
          {footer || (
            <>
              {prependFooter}
              {secondaryAction && (
                <SecondaryButton onClick={handleSecondary}>
                  {secondaryLabel || "Cancel"}
                </SecondaryButton>
              )}
              {!type && primaryAction && (
                <PrimaryButton
                  onClick={handlePrimary}
                  disabled={primaryDisabled}
                >
                  {primaryLabel}
                </PrimaryButton>
              )}

              {
                {
                  danger: (
                    <DangerButton
                      onClick={handlePrimary}
                      disabled={primaryDisabled}
                    >
                      {primaryLabel}
                    </DangerButton>
                  ),
                  warning: (
                    <WarningButton
                      onClick={handlePrimary}
                      disabled={primaryDisabled}
                    >
                      {primaryLabel}
                    </WarningButton>
                  ),
                  success: (
                    <SuccessButton
                      onClick={handlePrimary}
                      disabled={primaryDisabled}
                    >
                      {primaryLabel}
                    </SuccessButton>
                  ),
                  info: (
                    <PrimaryButton
                      onClick={handlePrimary}
                      disabled={primaryDisabled}
                    >
                      {primaryLabel}
                    </PrimaryButton>
                  )
                }[type]
              }
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}

export const SimpleDangerDialog = (props: IDialogProps) => (
  <SimpleDialog type={"danger"} {...props}>
    {props.children}
  </SimpleDialog>
)

export const SimpleWarningDialog = (props: IDialogProps) => (
  <SimpleDialog type={"warning"} {...props}>
    {props.children}
  </SimpleDialog>
)

export const SimpleSuccessDialog = (props: IDialogProps) => (
  <SimpleDialog type={"success"} {...props}>
    {props.children}
  </SimpleDialog>
)

export const SimpleInfoDialog = (props: IDialogProps) => (
  <SimpleDialog type={"info"} {...props}>
    {props.children}
  </SimpleDialog>
)

export const DangerDialog = (props: IDialogProps) => (
  <Dialog className={"danger"} {...props}>
    {props.children}
  </Dialog>
)

export const WarningDialog = (props: IDialogProps) => (
  <Dialog className={"warning"} {...props}>
    {props.children}
  </Dialog>
)

export const SuccessDialog = (props: IDialogProps) => (
  <Dialog className={"success"} {...props}>
    {props.children}
  </Dialog>
)

export const InfoDialog = (props: IDialogProps) => (
  <Dialog className={"info"} {...props}>
    {props.children}
  </Dialog>
)

export default {
  SimpleDialog,
  DangerDialog,
  WarningDialog,
  SuccessDialog,
  InfoDialog,
  SimpleDangerDialog,
  SimpleWarningDialog,
  SimpleSuccessDialog,
  SimpleInfoDialog
}
