// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { CONFIRMATION_MODAL_TYPES } from "./custom-sql-manager-utils"

const CustomSqlManagerModifyConfirmationModal = (props) => (
  <SimpleDialog
    {...props}
    title="Modify Shared Custom SQL"
    message={`This custom SQL is shared across ${props.warningText}s. The modifications you make here will be applied to all ${props.warningText} using it.`}
    primaryAction={props.applyAction}
    primaryLabel="Modify all references"
  />
)

const CustomSqlManagerDeleteSharedConfirmationModal = (props) => {
  const IN_USE_MESSAGE = `This custom SQL can’t be deleted because other ${props.warningText}s on this dashboard are using it. Edit these ${props.warningText}s to not use it before you can delete it.`
  const NOT_IN_USE_MESSAGE = `This custom SQL can safely be deleted because no other ${props.warningText} is using it. Are you ready to proceed?`

  return (
    <SimpleDialog
      {...props}
      title="Delete Shared Custom SQL"
      message={props.inUse ? IN_USE_MESSAGE : NOT_IN_USE_MESSAGE}
      primaryAction={
        props.inUse ? props.closeConfirmationModal : props.deleteAction
      }
      primaryLabel={props.inUse ? "Cancel" : "Yes, delete"}
      secondaryAction={props.inUse ? null : props.closeConfirmationModal}
      className={props.inUse ? "disabled" : ""}
    />
  )
}

const CustomSqlManagerDeleteGlobalConfirmationModal = (props) => (
  <SimpleDialog
    {...props}
    title="Delete Global Expression"
    message="This action will prevent this global expression from being used in new dashboards. Are you sure?"
    primaryAction={props.deleteAction}
    primaryLabel="Yes, delete"
    secondaryAction={props.closeConfirmationModal}
  />
)

const CustomSqlManagerConfimationModal = (props) => {
  const combinedDialogProps = {
    open,
    type: "warning",
    className: "custom-sql-manager-confirmation-modal",
    onClose: props.closeConfirmationModal,
    secondaryAction: props.closeConfirmationModal,
    ...props
  }

  switch (props.modalType) {
    case CONFIRMATION_MODAL_TYPES.MODIFY:
    default:
      return (
        <CustomSqlManagerModifyConfirmationModal {...combinedDialogProps} />
      )
    case CONFIRMATION_MODAL_TYPES.DELETE_SHARED:
      return (
        <CustomSqlManagerDeleteSharedConfirmationModal
          {...combinedDialogProps}
        />
      )
    case CONFIRMATION_MODAL_TYPES.DELETE_GLOBAL:
      return (
        <CustomSqlManagerDeleteGlobalConfirmationModal
          {...combinedDialogProps}
        />
      )
  }
}

export default CustomSqlManagerConfimationModal
