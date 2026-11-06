// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FunctionComponent, useRef } from "react"
import classNames from "classnames"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DangerButton,
  WarningButton,
  SuccessButton,
  SecondaryButton,
  PrimaryButton
} from "@immerse/ui"
import { Icon } from "@rmwc/icon"
import styles from "./dialog.module.css"

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
  type?: React.ComponentProps<typeof Dialog>["tone"]
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
  const titleRef = useRef<HTMLHeadingElement>(null)

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
      className={classNames(styles.dialog, type, className)}
      tone={type}
      open={open}
      onOpen={onOpen}
      onOpenAutoFocus={(event) => {
        if (titleRef.current) {
          event.preventDefault()
          titleRef.current.focus()
        }
      }}
      onClose={() => {
        onStateChange?.("closing")
        onClose("from state change")
      }}
      preventOutsideDismiss={preventOutsideDismiss}
      data-testid="simple-dialog"
    >
      {(title || !hideCloseIcon) && (
        <DialogTitle ref={titleRef} tabIndex={-1} className={styles.title}>
          {title}
          {!hideCloseIcon && (
            <Button
              variant="quiet"
              className={styles.close}
              aria-label="Close dialog"
              onClick={handleCloseFromHeader}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Button>
          )}
        </DialogTitle>
      )}
      <DialogContent
        className={classNames(
          styles.content,
          !children && styles.messageContent
        )}
      >
        {children ? (
          children
        ) : (
          <>
            {type && (
              <div className={styles.messageIcon} aria-hidden="true">
                {(type === "warning" || type === "danger") && (
                  <Icon className={styles.statusIcon} icon="warning_outline" />
                )}
                {type === "success" && (
                  <Icon
                    className={styles.statusIcon}
                    icon="check_circle_outline"
                  />
                )}
                {type === "info" && (
                  <Icon className={styles.statusIcon} icon="info_outline" />
                )}
              </div>
            )}
            <div className={classNames("dialog-message", styles.message)}>
              {Array.isArray(message)
                ? message.map((msg, i) => <p key={i}>{msg}</p>)
                : message}
            </div>
          </>
        )}
      </DialogContent>
      {(footer || primaryAction || secondaryAction) && (
        <DialogActions className={styles.actions}>
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
  <Dialog tone="danger" className={"danger"} {...props}>
    {props.children}
  </Dialog>
)

export const WarningDialog = (props: IDialogProps) => (
  <Dialog tone="warning" className={"warning"} {...props}>
    {props.children}
  </Dialog>
)

export const SuccessDialog = (props: IDialogProps) => (
  <Dialog tone="success" className={"success"} {...props}>
    {props.children}
  </Dialog>
)

export const InfoDialog = (props: IDialogProps) => (
  <Dialog tone="info" className={"info"} {...props}>
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
