// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"

import { importSettingsShape } from "constants/prop-types"
import Table from "components/table/table-parent"

export default class TablePreview extends Component {
  static propTypes = {
    copyParams: importSettingsShape,
    hasPreviewDataFinishedLoading: PropTypes.bool,
    importerData: PropTypes.object,
    requestImportPreviewData: PropTypes.func,
    shouldShowChangedColumnHeaders: PropTypes.bool,
    showChangedColumnHeaders: PropTypes.func,
    appendTableName: PropTypes.string,
    showColumnCountMismatchModal: PropTypes.func,
    columnCountMismatch: PropTypes.bool
  }

  componentDidMount() {
    this.props.requestImportPreviewData(
      this.props.filesToUpload,
      this.props.copyParams
    )
  }

  componentDidUpdate() {
    const {
      shouldShowChangedColumnHeaders,
      showChangedColumnHeaders,
      showColumnCountMismatchModal,
      columnCountMismatch
    } = this.props
    if (shouldShowChangedColumnHeaders) {
      showChangedColumnHeaders()
    }
    if (columnCountMismatch) {
      showColumnCountMismatchModal()
    }
  }

  render() {
    const { appendTableName, isRaster } = this.props
    const editableHeaders = Boolean(!appendTableName)
    const editableTypes = editableHeaders && !isRaster

    const previewPlaceholder = isRaster ? (
      <span>Data preview is not available for raster imports</span>
    ) : null

    return (
      <div className="import-table-preview-wrapper">
        {this.props.hasPreviewDataFinishedLoading && (
          <Table
            {...{
              editableHeaders,
              editableTypes,
              appendTableName,
              previewPlaceholder
            }}
          />
        )}
      </div>
    )
  }
}
