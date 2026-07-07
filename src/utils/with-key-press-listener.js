// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

export default function withKeyPressListener(listener) {
  return (BaseElement) =>
    class KeyPressListener extends React.Component {
      componentDidMount() {
        window.addEventListener("keydown", this.handleKeyPress)
      }
      componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyPress)
      }
      handleKeyPress = (e) => {
        listener(this.props)(e)
      }
      render() {
        return <BaseElement {...this.props} />
      }
    }
}
