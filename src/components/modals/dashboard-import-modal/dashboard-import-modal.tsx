// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  PrimaryButton,
  SecondaryButtonNoBorder,
  DialogTitle,
  DialogContent,
  DialogActions,
  FileDrop
} from "@immerse/ui"
import React, { FC, useState } from "react"
import { InfoDialog } from "widgets/dialog/Dialog"
import IconImport from "components/svg-icons/icon-import"
import ImportSuccessIcon from "components/svg-icons/icon-import-success"
import ImportWarningIcon from "components/svg-icons/icon-import-warning"
import {
  HEADER_TEXT,
  PRIMARY_BUTTON_TEXT,
  SECONDARY_BUTTON_TEXT,
  FILE_READ_ERROR,
  INVALID_FILE_FORMAT_ERROR,
  DRAG_MESSAGE,
  BROWSE_MESSAGE_PREFIX,
  BROWSE_MESSAGE,
  BROWSE_MESSAGE_SUFFIX,
  IMPORT_READY_MESSAGE,
  UNSUPPORTED_FILE_MESSAGE
} from "constants/dashboard-import-modal"

type Props = {
  hideModal: Function
  importDashboard: Function
}

const handleFileLoad = (
  reader,
  setDashboardToImport,
  setFileLoadError
) => () => {
  try {
    // Include \r in case user modified/saved on Windows
    const fileLines = (reader.result as string).split(/[\r\n]+/)

    setDashboardToImport({
      title: fileLines[0],
      metadata: JSON.stringify(JSON.parse(fileLines[1])),
      state: JSON.stringify(JSON.parse(fileLines[2]))
    })
  } catch {
    setFileLoadError(INVALID_FILE_FORMAT_ERROR)
  }
}

const handleFileError = (setFileLoadError) => () => {
  setFileLoadError(FILE_READ_ERROR)
}

const dropzoneEventHandlers = (setDashboardToImport, setFileLoadError) => ({
  addedfile: (file) => {
    const reader = new FileReader()

    setDashboardToImport(null)
    setFileLoadError(null)

    // File expected to be an exported dashboard file that has this three-line format:
    //
    // <dashboard name, as a flat unquoted string>
    // <dashboard metadata json - small object with 'table' (data source list) and 'version' properties>
    // <dashboard state json - all of the other dashboard properties>
    //
    // This format is what's already returned by omnisql's export_dashboard
    // See
    // https://www.heavy.ai/docs/latest/3_creating_a_dashboard.html#exporting-and-importing-a-dashboard-definition
    reader.onload = handleFileLoad(
      reader,
      setDashboardToImport,
      setFileLoadError
    )

    reader.onerror = handleFileError(setFileLoadError)

    reader.readAsText(file)
    return () => reader.abort()
  }
})

const handleClose = (hideModal) => () => {
  hideModal()
}

const handleImport = (hideModal, importDashboard, dashboardToImport) => () => {
  importDashboard(
    dashboardToImport.title,
    dashboardToImport.metadata,
    dashboardToImport.state
  )
  hideModal()
}

const DashboardImportModal: FC<Props> = ({ hideModal, importDashboard }) => {
  const [dashboardToImport, setDashboardToImport] = useState(null)
  const [fileLoadError, setFileLoadError] = useState(null)

  return (
    <InfoDialog open onClose={handleClose(hideModal)} className="import-dialog">
      <DialogTitle className="import-dialog-title">
        {HEADER_TEXT}
        <button
          type="button"
          className="import-dialog-close"
          aria-label="Close dialog"
          onClick={handleClose(hideModal)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </DialogTitle>
      <DialogContent className="import-dialog-content">
        <FileDrop
          className="import-dropzone"
          label="Choose dashboard file"
          onFile={
            dropzoneEventHandlers(setDashboardToImport, setFileLoadError)
              .addedfile
          }
        >
          {fileLoadError ? (
            <div className="import-message import-message-warning">
              <div className="import-message-icon">
                <ImportWarningIcon />
              </div>
              <div className="import-message-text">
                {UNSUPPORTED_FILE_MESSAGE}
              </div>
              <div className="import-message-progress-bar-container">
                <div className="import-message-progress-bar" />
              </div>
            </div>
          ) : dashboardToImport ? (
            <div className="import-message import-message-success">
              <div className="import-message-icon">
                <ImportSuccessIcon />
              </div>
              <div className="import-message-text">{IMPORT_READY_MESSAGE}</div>
              <div className="import-message-progress-bar-container">
                <div className="import-message-progress-bar" />
              </div>
            </div>
          ) : (
            <div className="import-prompt dz-message dropzone-clickable">
              <div className="import-drag-hint">
                <IconImport className="import-prompt-icon" /> {DRAG_MESSAGE}
              </div>
              <div>
                {BROWSE_MESSAGE_PREFIX}{" "}
                <span className="import-browse-link">{BROWSE_MESSAGE}</span>{" "}
                {BROWSE_MESSAGE_SUFFIX}
              </div>
              {fileLoadError && (
                <div className="import-file-load-error">{fileLoadError}</div>
              )}
            </div>
          )}
        </FileDrop>
      </DialogContent>
      <DialogActions>
        <SecondaryButtonNoBorder
          className="import-dialog-action-button"
          onClick={handleClose(hideModal)}
        >
          {SECONDARY_BUTTON_TEXT}
        </SecondaryButtonNoBorder>
        <PrimaryButton
          className="import-dialog-action-button"
          onClick={handleImport(hideModal, importDashboard, dashboardToImport)}
          disabled={!dashboardToImport}
        >
          {PRIMARY_BUTTON_TEXT}
        </PrimaryButton>
      </DialogActions>
    </InfoDialog>
  )
}

export default DashboardImportModal
