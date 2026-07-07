// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { Icon } from "@rmwc/icon"
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu"

import { noop } from "utils/helpers"

import "./cohort-kebab.scss"

const CHANGE_DIMENSION = "Change cohort dimension"

class CohortKebab extends React.PureComponent {
  state = {
    isOpen: false
  }
  setOpen = (open) => {
    this.setState({
      isOpen: open
    })
  }
  changeDimension = (e) => {
    e.stopPropagation()
    this.props.changeCohortDimension()
    this.setOpen(false)
  }
  render() {
    const { hasDimension } = this.props
    const { isOpen } = this.state
    return (
      <MenuSurfaceAnchor>
        <Menu
          open={isOpen}
          onSelect={(e) => {
            e.stopPropagation()
            this.setOpen(false)
          }}
          onClose={(e) => {
            e.stopPropagation()
            this.setOpen(false)
          }}
          hoistToBody
          focusOnOpen={false}
          className="cohort-kebab-menu"
        >
          {hasDimension && (
            <MenuItem onClick={this.changeDimension}>
              {CHANGE_DIMENSION}
            </MenuItem>
          )}
        </Menu>
        <div
          className="cohort-kebab-button"
          onClick={(e) => {
            e.stopPropagation()
            this.setOpen(!isOpen)
          }}
          data-testid="cohort-kebab-menu"
        >
          <Icon icon="more_vert" />
        </div>
      </MenuSurfaceAnchor>
    )
  }
}

CohortKebab.propTypes = {
  filterSet: PropTypes.shape({
    dimensions: PropTypes.object,
    filters: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.string,
    name: PropTypes.string,
    selected: PropTypes.bool
  }),
  dataSource: PropTypes.string,
  hasDimension: PropTypes.bool,
  changeCohortDimension: PropTypes.func
}

CohortKebab.defaultProps = {
  filterSet: null,
  dataSource: null,
  hasDimension: null,
  changeCohortDimension: noop
}

export default CohortKebab
