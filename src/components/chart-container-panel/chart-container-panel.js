// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import ChartContainerParent from "components/chart-container/chart-container-parent"
import { isIE11 } from "utils/browser-detection"
import TextContainer from "charts/text/text-container"
import Text2Container from "charts/text2/text-container"

const ChartContainerPanel = ({ chartType, id, ...props }) => {
  if (chartType === "text") {
    if (isIE11()) {
      /*
        Fix for IE11 that doesn't call mapStateToProps on state change
        but it does on props change https://github.com/heavyai/immerse/issues/3344
       */
      return <TextContainer id={id} rnd={Math.random()} />
    } else {
      return <TextContainer id={id} />
    }
  } else if (chartType === "text2") {
    if (isIE11()) {
      return <Text2Container id={id} rnd={Math.random()} />
    } else {
      return <Text2Container id={id} />
    }
  } else {
    return <ChartContainerParent cid={id} {...props} />
  }
}

ChartContainerPanel.propTypes = {
  chartType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
}

export default ChartContainerPanel
