// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

export default class NavDropdown extends Component {
  static propTypes = {
    closeDropdown: PropTypes.func,
    displayText: PropTypes.string,
    testid: PropTypes.string.isRequired,
    dropDownLinks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.text,
        onClick: PropTypes.func,
        text: PropTypes.string
      })
    ).isRequired,
    icon: PropTypes.shape({
      className: PropTypes.string,
      name: PropTypes.string
    }),
    isOpen: PropTypes.bool.isRequired,
    togglePopover: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired
  }

  componentDidUpdate() {
    if (this.props.isOpen) {
      document.addEventListener("mousedown", this.handleEvent)
    } else {
      document.removeEventListener("mousedown", this.handleEvent)
    }
  }

  setRef = (node) => {
    this.ref = node
  }

  handleEvent = (e) => {
    if (this.ref && !this.ref.contains(e.target)) {
      this.props.closeDropdown()
    }
  }

  render() {
    return (
      <div
        data-testid={this.props.testid}
        className={`button ${this.props.type}-dropdown-display ${
          this.props.isOpen && "active"
        }`}
        id={`${this.props.type}-dropdown`}
        onClick={this.props.togglePopover}
        ref={this.setRef}
      >
        {this.props.isOpen && (
          <ul className={`${this.props.type}-popover`}>
            {this.props.dropDownLinks.map(
              (link, index) =>
                (typeof link.condition === "undefined" || link.condition) && (
                  <li key={index}>
                    <div
                      className={link.onClick ? "highlight" : "displayText"}
                      id={link.id}
                      data-testid={`${link.id}-dropdown-link`}
                      onClick={link.onClick}
                    >
                      <span>{link.text}</span>
                    </div>
                  </li>
                )
            )}
          </ul>
        )}
        {this.props.displayText && (
          <span className="dropdown-display-text">
            {this.props.displayText}
            <span className="dropdown-display-icon">
              <Icon name="tick" />
            </span>
          </span>
        )}
        {this.props.icon && (
          <span className={this.props.icon.className}>
            <Icon name={this.props.icon.name} />
            <span className="dropdown-display-icon">
              <Icon name="tick" />
            </span>
          </span>
        )}
      </div>
    )
  }
}
