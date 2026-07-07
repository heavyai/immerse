// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  LETTER_PIXEL_SIZE,
  MIN_INPUT_BOX_SIZE
} from "constants/magic-variables"
import React, { Component } from "react"
import { TextField } from "@rmwc/textfield"
import PropTypes from "prop-types"
import cx from "classnames"
import Icon from "components/icon/icon"
import { updateColumnName } from "actions/importer-action-creators"

export const getDefaultWidth = (numOfLetters) => {
  const lettersToPixelsLength = numOfLetters * LETTER_PIXEL_SIZE
  if (lettersToPixelsLength < MIN_INPUT_BOX_SIZE) {
    return `${MIN_INPUT_BOX_SIZE}px`
  } else {
    return `${lettersToPixelsLength}px`
  }
}

const propTypes = {
  dispatch: PropTypes.func,
  isNotValid: PropTypes.string,
  columnName: PropTypes.string,
  columnId: PropTypes.number
}

export class EditableColumnHeader extends Component {
  onSubmit = (e) => {
    e.preventDefault()
    this.input.blur()
  }

  onChange = ({ target: { value } }) => {
    const { dispatch, columnId } = this.props

    dispatch(updateColumnName(value, columnId))
  }

  setInputRef = (n) => {
    this.input = n
  }

  render() {
    const { isNotValid, columnName } = this.props

    return (
      <div className="column-name-wrap">
        <form onSubmit={this.onSubmit} data-testid="form-column-header">
          <TextField
            outlined
            className={cx("editable-column-header", {
              invalid: isNotValid
            })}
            onBlur={this.onBlur}
            onChange={this.onChange}
            placeholder="Column Name..."
            ref={this.setInputRef}
            style={{ minWidth: getDefaultWidth(columnName.length) }}
            type={"text"}
            value={columnName}
          />
          {columnName && !isNotValid && (
            <div className="column-name-label">
              <span>{columnName}</span>
              <Icon name="pencil" />
            </div>
          )}

          {isNotValid && (
            <div className="input-error-msg-wrap-header">
              <div className="input-error-msg">{isNotValid}</div>
            </div>
          )}
        </form>
      </div>
    )
  }
}

EditableColumnHeader.propTypes = propTypes

export default EditableColumnHeader
