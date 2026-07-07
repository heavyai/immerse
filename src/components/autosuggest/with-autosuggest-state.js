// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { populateAutosuggest } from "actions/autosuggest-action-creators"
import { connect } from "react-redux"
import { debounce } from "utils/helpers"
import { getFilterSize } from "actions/dashboard-filters-action-creators"

const AUTOSUGGEST_DEBOUNCE = 500

export const mapStateToProps = ({ autosuggest }) => ({
  autosuggestedOptions: autosuggest.results || {} // results are of type {expression: [{value: String, count: Number}]}
})

export const mapDispatchToProps = (dispatch) => ({
  getFilterSize(index) {
    dispatch(getFilterSize(index))
  },
  autosuggest: debounce(
    (searchString, dataExpression, dataSource) =>
      dispatch(populateAutosuggest(dataExpression, searchString, dataSource)),
    AUTOSUGGEST_DEBOUNCE
  )
})

export default connect(mapStateToProps, mapDispatchToProps)
