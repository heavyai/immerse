// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import CopyToClipboard from "react-copy-to-clipboard"
import IconDuplicate from "components/svg-icons/icon-duplicate"

class ShareLinkForm extends Component {
  static propTypes = {
    formattedLink: PropTypes.string
  }

  highlightText = () => {
    this.inputbox.select()
  }

  onFocus = () => {
    this.inputbox.select()
  }

  setupInputRef = (node) => {
    this.inputbox = node
  }

  render() {
    return (
      <div className="dashboard-share-modal--share-link-form">
        <label>Copy a link to share with your recipients</label>
        <input
          id="dashboard-share-modal-copy-link-input"
          type="text"
          readOnly
          onFocus={this.onFocus}
          value={this.props.formattedLink}
          ref={this.setupInputRef}
        />
        <CopyToClipboard
          id="dasboard-share-copy"
          onCopy={this.highlightText}
          text={this.props.formattedLink}
        >
          <button className="button">
            <IconDuplicate />
          </button>
        </CopyToClipboard>
      </div>
    )
  }
}

export default ShareLinkForm
