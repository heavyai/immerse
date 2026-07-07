// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-unused-expressions */
import React, { FC, useEffect, useRef, useCallback, useState } from "react"
import Dropzone from "dropzone"
import cx from "classnames"
import { connect } from "react-redux"
import Icon from "components/icon/icon"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { indexOf, remove } from "ramda"
import {
  parseExtension,
  doesShapeHaveError
} from "components/table-importer/table-importer-helpers"
import { IMPORT_FILE_TYPES } from "constants/import-file-types"
import { SOURCE_TYPE_OPTIONS } from "./constants"
import { useHistory, useParams } from "react-router"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { submitLocalFileConnector as submitLocalFileConnectorAction } from "../../actions/importer-action-creators"
import { pushImportPreviewRoute } from "./utils/push-import-preview-route"

import "./import-form.scss"
import "./import-local-file.scss"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import { hideModal, showModal } from "../../actions/ui-action-creators"
import { filenameToSourceTypeHeuristics } from "./utils/source-type-heuristics"

type ImportLocalFileProps = {
  serverUrl: string
  sessionId: string
  submitLocalFileConnector: (
    uploadedFilenames: string[],
    sourceType: TSourceType
  ) => void
  displayError: (errorHeading: string, errorMessage: string) => void
}

const ImportLocalFile: FC<ImportLocalFileProps> = ({
  serverUrl,
  sessionId,
  submitLocalFileConnector,
  displayError
}) => {
  const [fileAdded, setFileAdded] = useState(false)
  const [uploadedFilenames, setUploadedFilenames] = useState<string[]>([])
  const [importType, setImportType] = useState<
    "" | "multiFileGeo" | "singleFileGeo" | "standard" | "parquet"
  >("")
  const [disableSourceTypeField, setDisableSourceTypeField] = useState(false)
  const [sourceType, setSourceType] = useState(null)
  const params = useParams()
  const history = useHistory()
  const dropzoneRef = useRef(null)
  const myDropzone = useRef(null)

  const addedFileHandler = useCallback((_file: File) => setFileAdded(true), [])
  const successHandler = useCallback(
    async (file: File, filename: string) => {
      try {
        const parsedSourceType = await filenameToSourceTypeHeuristics(filename)
        if (parsedSourceType !== null) {
          setSourceType(
            SOURCE_TYPE_OPTIONS.find(({ value }) => value === parsedSourceType)
          )
          setDisableSourceTypeField(true)
        }
      } catch (error) {
        myDropzone.current.removeFile(file)
        displayError("Import Error", error.message)
        return
      }

      const fileExtension = parseExtension(filename)
      const newImportType = IMPORT_FILE_TYPES[fileExtension]
      setImportType(newImportType)

      setUploadedFilenames((oldUploadedFilenames) => {
        const newUploadedFilenames = [...oldUploadedFilenames, filename]

        if (
          newUploadedFilenames.length === 1 &&
          newImportType === "singleFileGeo"
        ) {
          myDropzone.current.options.maxFiles = 1
        }

        return newUploadedFilenames
      })
    },
    [myDropzone, displayError]
  )
  const removedFileHandler = useCallback((file: File) => {
    setUploadedFilenames((oldUploadedFilenames) => {
      if (!oldUploadedFilenames.includes(file.name)) {
        if (!oldUploadedFilenames.length) {
          setFileAdded(false)
        }
        return oldUploadedFilenames
      }
      const newUploadedFilenames = remove(
        indexOf(file.name, oldUploadedFilenames),
        1,
        oldUploadedFilenames
      )
      if (!newUploadedFilenames.length) {
        setImportType("")
        setFileAdded(false)
        setDisableSourceTypeField(false)
        setSourceType(setSourceType(null))
        myDropzone.current.options.maxFiles = null
      }

      return newUploadedFilenames
    })
  }, []) // eslint-disable-line

  useEffect(() => {
    if (!myDropzone.current) {
      myDropzone.current = new Dropzone(dropzoneRef.current, {
        url: `${serverUrl}/upload`,
        params: {
          sessionid: sessionId
        },
        withCredentials: true,
        addRemoveLinks: true,
        paramName: "binary",
        maxFilesize: 16384,
        clickable: ".dropzone-wrapper",
        previewsContainer: "#previewsContainer",
        dictDefaultMessage: "",
        dictRemoveFile: "",
        dictCancelUpload: ""
      })
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (myDropzone.current) {
      myDropzone.current.on("addedfile", addedFileHandler)
      myDropzone.current.on("success", successHandler)
      myDropzone.current.on("removedfile", removedFileHandler)
    }
    return () => {
      myDropzone.current?.off("addedfile", addedFileHandler)
      myDropzone.current?.off("success", successHandler)
      myDropzone.current?.off("removedfile", removedFileHandler)
    }
  }, [addedFileHandler, successHandler, removedFileHandler])

  const handleSubmit = async () => {
    if (
      importType === "multiFileGeo" &&
      doesShapeHaveError(uploadedFilenames)
    ) {
      displayError(
        "Shape Importer Error",
        doesShapeHaveError(uploadedFilenames)
      )
    } else {
      await submitLocalFileConnector(uploadedFilenames, sourceType.value)
      pushImportPreviewRoute(history, params)
    }
  }

  return (
    <div className="import-form import-local-file">
      <div className="dropzone-wrapper">
        <div className="filepicker dropzone" ref={dropzoneRef}>
          {fileAdded || Boolean(uploadedFilenames.length) || (
            <div className="drop-area-cta">
              <div className="drop-area-icon">
                <Icon name="dropfiles" viewBox="-2 0 48 48" />
              </div>
              <div className="drop-area-msg">
                Click To Browse or <br />
                Drop Files Here To Upload
              </div>
            </div>
          )}
          <div
            className={cx({
              "has-addfile":
                uploadedFilenames.length && importType !== "singleFileGeo"
            })}
            id="previewsContainer"
          />
        </div>
      </div>
      <div className="file-type-container">
        <MultiSelect
          placeholder="File Type"
          value={sourceType}
          options={SOURCE_TYPE_OPTIONS}
          onChange={setSourceType}
          isDisabled={disableSourceTypeField}
        />
      </div>

      <footer>
        <SecondaryButton onClick={history.goBack}>Cancel</SecondaryButton>
        <PrimaryButton
          {...{
            onClick: handleSubmit,
            disabled: !uploadedFilenames.length || !sourceType
          }}
        >
          Preview
        </PrimaryButton>
      </footer>
    </div>
  )
}

const mapStateToProps = ({
  connection: {
    user: { host, port, protocol },
    sessionId
  }
}) => ({
  serverUrl: `${protocol}://${host}:${port}`,
  sessionId
})

const mapDispatchToProps = (dispatch) => ({
  submitLocalFileConnector: (
    uploadedFilenames: string[],
    sourceType: TSourceType
  ) => dispatch(submitLocalFileConnectorAction(uploadedFilenames, sourceType)),
  displayError(errorHeading: string, errorMessage: string) {
    dispatch(
      showModal({
        heading: errorHeading,
        content: errorMessage,
        primaryAction: {
          action: () => dispatch(hideModal()),
          text: "OK"
        }
      })
    )
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ImportLocalFile)
