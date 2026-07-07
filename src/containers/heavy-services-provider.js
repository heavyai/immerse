// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Children, Component } from "react"
import PropTypes from "prop-types"

export default class HeavyServicesProvider extends Component {
  constructor(props) {
    super(props)
    this.MapD = props.services
  }

  getChildContext() {
    return {
      MapD: this.MapD
    }
  }

  render() {
    const { children } = this.props
    return Children.only(children)
  }
}

HeavyServicesProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  services: PropTypes.object.isRequired
}

HeavyServicesProvider.childContextTypes = {
  MapD: PropTypes.object.isRequired
}
