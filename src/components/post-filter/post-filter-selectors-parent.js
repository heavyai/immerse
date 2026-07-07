// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "recompose/compose"
import PostFilterSelectorsContainer from "./post-filter-selectors-container"
import { PropTypes } from "prop-types"
import SelectorsContainer from "components/selectors-container/selectors-container"
import setPropTypes from "recompose/setPropTypes"

export default compose(
  setPropTypes({
    type: PropTypes.oneOf(["postFilters"]).isRequired,
    selectors: PropTypes.arrayOf(PropTypes.object).isRequired,
    chartId: PropTypes.string.isRequired
  }),
  SelectorsContainer
)(PostFilterSelectorsContainer)
