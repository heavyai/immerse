// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { ResizableBox } from "react-resizable"
import { Icon } from "@rmwc/icon"

import "./pill-container.scss"

// See pill-container.scss - .add-selection-container (width set to 34px)
const SIZE_OF_PILL_CONTAINER_MENU_AREA = 34

export default class PillContainer extends PureComponent {
  static propTypes = {
    minHeight: PropTypes.number,
    width: PropTypes.number,
    remove: PropTypes.func,
    add: PropTypes.func,
    values: PropTypes.arrayOf(PropTypes.string)
  }

  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      morePillPosition: props.values.length,
      numHidden: 0
    }
  }

  componentDidMount() {
    this.recalculateMorePillPosition()
  }

  componentDidUpdate() {
    this.recalculateMorePillPosition()
  }

  recalculateMorePillPosition() {
    if (!this.pillContainerNode) {
      return
    }

    const pills = this.pillContainerNode.getElementsByClassName(
      "selection-pill"
    )

    // FIXME: ballparked; recheck after we polish final dimensions
    const pillAreaWidth = this.props.width - SIZE_OF_PILL_CONTAINER_MENU_AREA
    const morePillWidth = 82
    const freeWidth = pillAreaWidth - morePillWidth

    let numTopRowElements = 0
    let widthTopRowElements = 0

    Array.from(pills).forEach((el) => {
      widthTopRowElements += el.clientWidth
      if (widthTopRowElements < freeWidth) {
        numTopRowElements = numTopRowElements + 1
      }
    })

    this.setState({
      morePillPosition: numTopRowElements,
      numHidden:
        this.props.values.filter((value) => value !== null).length -
        numTopRowElements
    })
  }

  /* this can go either onResize or onResizeStop
     the former is smoother looking but a little buggy when combined with scroll
     scroll-container div exists just to minimize scroll bar sticking to the bottom
     instead of top when expanding box
  */
  onResize = (e, { size }) => {
    this.setState({ expanded: size.height > this.props.minHeight })
  }

  selectionPill(value, i) {
    return (
      <div className="selection-pill" key={i}>
        <div className="pill-value">{value}</div>
        <div className="pill-close">
          <Icon icon="cancel" onClick={() => this.props.remove(value)} />
        </div>
      </div>
    )
  }

  morePill(numHidden) {
    return (
      <div className="selection-pill-more" key={"more-pill"}>
        <div className="pill-value">{`${numHidden} more...`}</div>
      </div>
    )
  }

  render() {
    const pills = this.props.values
      .filter((value) => value !== null)
      .map((value, i) => this.selectionPill(value, i))

    if (
      !this.state.expanded &&
      this.props.values.length > 1 &&
      this.state.morePillPosition !== this.props.values.length
    ) {
      pills.splice(
        this.state.morePillPosition,
        0,
        this.morePill(this.state.numHidden)
      )
    }

    return (
      <ResizableBox
        height={this.props.minHeight}
        width={this.props.width}
        minConstraints={[this.props.width, this.props.minHeight]}
        axis={"y"}
        className={"filter-operator-multi-select"}
        onResize={this.onResize}
      >
        <div
          className={`scroll-container ${
            this.state.expanded ? "scrollable" : ""
          }`}
        >
          <div
            className="selections-pill-container"
            ref={(node) => {
              this.pillContainerNode = node
            }}
          >
            {pills}
          </div>
          <div className="add-selection-container">
            <div className="add-selection">
              <Icon
                icon="add"
                onClick={this.props.add}
                data-testid="add-filter-set-button"
                className="add"
              />
            </div>
          </div>
        </div>
      </ResizableBox>
    )
  }
}
