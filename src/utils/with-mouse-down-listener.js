// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

export default function withMouseDownListener(callback) {
  return (BaseComponent) =>
    class MouseDownListener extends React.Component {
      componentDidMount() {
        document.addEventListener("mousedown", this.handleEvent)
      }

      componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleEvent)
      }

      handleEvent = (e) => {
        const node = this.componentRef
        if ((node && node.contains(e.target)) || e.button !== 0) {
          return false
        }

        e.stopPropagation()
        return callback(this.props)(e)
      }

      setupComponentRef = (node) => {
        this.componentRef = node
      }

      render() {
        return (
          <div ref={this.setupComponentRef}>
            <BaseComponent {...this.props} />
          </div>
        )
      }
    }
}
