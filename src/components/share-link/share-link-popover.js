// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import CopyToClipboard from "react-copy-to-clipboard"
import Icon from "components/icon/icon"
import { MS_IN_SECONDS } from "constants/magic-variables"

export class ShareLinkPopover extends Component {
  static propTypes = {
    formattedLink: PropTypes.string,
    hideSuccessMsg: PropTypes.func,
    shouldShowSuccessMsg: PropTypes.bool,
    showSuccessMsg: PropTypes.func
  }

  highlightText = () => {
    this.props.showSuccessMsg()
    this.inputbox.select()
    this.props.hideSuccessMsg()
  }

  onFocus = () => {
    this.inputbox.select()
  }

  setupInputRef = (node) => {
    this.inputbox = node
  }

  render() {
    return (
      <div data-testid="share-link-popover" className="share-link-popover">
        <span className="share-link-label">{"Share Link"}</span>
        <div className="share-link-row">
          <div className="share-input-wrapper">
            <input
              className="share-link-input-box"
              onFocus={this.onFocus}
              readOnly
              ref={this.setupInputRef}
              value={this.props.formattedLink}
            />
            {this.props.shouldShowSuccessMsg && (
              <div className="copy-success">{"Copied to Clipboard"}</div>
            )}
          </div>
          <CopyToClipboard
            id="dashboard-share-copy"
            data-testid="dashboard-share-copy"
            onCopy={this.highlightText}
            text={this.props.formattedLink}
          >
            <button
              className="button icon-btn share-link-copy-btn"
              title="Copy to Clipboard"
            >
              <Icon name="clipboard" />
            </button>
          </CopyToClipboard>
        </div>
      </div>
    )
  }
}

function ShareLinkWithFeedback(props) {
  const [shouldShowSuccessMsg, setShowSuccess] = React.useState(false)
  const timer = React.useRef(null)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const showSuccessMsg = () => setShowSuccess(true)
  const hideSuccessMsg = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setShowSuccess(false), MS_IN_SECONDS)
  }
  return (
    <ShareLinkPopover
      {...props}
      shouldShowSuccessMsg={shouldShowSuccessMsg}
      showSuccessMsg={showSuccessMsg}
      hideSuccessMsg={hideSuccessMsg}
    />
  )
}

export default ShareLinkWithFeedback
