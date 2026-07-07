// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import mapProps from "recompose/mapProps"

export default class Popover extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired,
    className: PropTypes.string,
    isOpened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func,
    style: PropTypes.object
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleEvent)
    document.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleEvent)
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown = (e) => {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e)
    }
  }

  handleEvent = (e) => {
    if (!this.props.isOpened) {
      return
    }

    const node = this.popoverRef
    if ((node && node.contains(e.target)) || e.button !== 0) {
      return
    }

    if (
      e.target.id.includes("react-select-") ||
      e.target.className === "Select-value-icon" ||
      e.target.className === "Select-clear"
    ) {
      return
    }

    e.stopPropagation()
    this.props.onClose(e)
  }

  setupPopoverRef = (node) => {
    this.popoverRef = node
  }

  render() {
    return (
      <div
        className={cx("react-popover", this.props.className)}
        ref={this.setupPopoverRef}
        style={this.props.style}
      >
        {this.props.isOpened && this.props.children}
      </div>
    )
  }
}

function mapTargetToPosition({ target, overflowWidth, ...props }) {
  const bounds = target.getBoundingClientRect()

  const left = props.offsetLeft ? bounds.left + props.offsetLeft : bounds.left
  const top = props.offsetTop
    ? target.offsetTop + props.offsetTop
    : target.offsetTop

  function getOffsetLeft(w) {
    const overflow = target.offsetLeft + w - window.innerWidth
    return left - (overflow > 0 ? overflow : 0)
  }

  return {
    style: {
      position: "absolute",
      marginTop: top,
      left: overflowWidth ? getOffsetLeft(overflowWidth) : left
    },
    ...props
  }
}

export const TargetedPopover = mapProps(mapTargetToPosition)(Popover)
