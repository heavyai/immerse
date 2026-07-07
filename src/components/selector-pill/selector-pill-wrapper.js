// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as UIActions from "actions/ui-action-creators"
import React, { useRef, useState, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { TOP_BAR_HEIGHT } from "constants/magic-variables"
import { selectorShape } from "constants/prop-types"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"

function mapStateToProps({ charts }, { chartId }) {
  const { measures, dimensions } = charts[chartId]
  return {
    numSelectors: measures.length + dimensions.length
  }
}

function mapDispatchToProps(dispatch, { chartId, selectorType, index }) {
  return {
    setSelectorPillHover() {
      dispatch(
        UIActions.setSelectorPillHoverFromIndex(chartId, selectorType, index)
      )
    },
    selectorPillNotHover() {
      dispatch(UIActions.selectorPillNotHover())
    },
    setSelectorPosition(position) {
      dispatch(UIActions.setSelectorPosition(selectorType, index, position))
    }
  }
}

export function SelectorPillWrapper(props) {
  const selectorPillWrapperRef = useRef(null)
  const [lastNumSelectors, setLastNumSelectors] = useState(-1)

  const { setSelectorPosition, numSelectors } = props

  const updateSelectorPosition = useCallback(() => {
    if (selectorPillWrapperRef.current) {
      const { top } = selectorPillWrapperRef.current.getBoundingClientRect()
      const topOffset = getFeatureFlag(available_feature_flags.GLOBAL_SIDE_NAV)
        ? 0
        : TOP_BAR_HEIGHT
      const position = top + window.pageYOffset - topOffset
      setSelectorPosition(position)
    }
  }, [selectorPillWrapperRef, setSelectorPosition])

  useEffect(() => {
    if (lastNumSelectors !== numSelectors) {
      setLastNumSelectors(numSelectors)
      updateSelectorPosition()
    }
  }, [updateSelectorPosition, numSelectors, lastNumSelectors])

  const mouseOver = () => {
    if (!props.editMode) {
      props.setSelectorPillHover()
    }
  }

  const mouseLeave = () => {
    props.selectorPillNotHover()
  }

  // Sometimes, a click on the popup inside this wrapper can cause the wrapper's container to shrink, missing the mouseLeave.
  // This will also remove the hover tooltip after a click even while the mouse is still inside the wrapper, but that's okay
  const mouseClick = () => {
    props.selectorPillNotHover()
  }

  return (
    <div
      data-testid="selector-pill-wrapper"
      className="selector-pill-wrapper"
      onMouseLeave={mouseLeave}
      onMouseOver={mouseOver}
      onClick={mouseClick}
      ref={selectorPillWrapperRef}
    >
      {props.children}
    </div>
  )
}

SelectorPillWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  editMode: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  numSelectors: PropTypes.number.isRequired,
  selector: selectorShape.isRequired,
  selectorPillNotHover: PropTypes.func.isRequired,
  selectorType: PropTypes.string.isRequired,
  setSelectorPillHover: PropTypes.func.isRequired,
  setSelectorPosition: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectorPillWrapper)
