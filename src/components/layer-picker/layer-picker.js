// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { hideModal, showModal } from "actions/ui-action-creators"
import React, { useEffect, useState, useRef } from "react"
import PropTypes from "prop-types"
import { chartShape } from "constants/prop-types"
import cx from "classnames"
import Icon from "components/icon/icon"
import { isLayerValid } from "charts/raster-chart/raster-utils"
import { Icon as IconEdit } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { CHART_DEFS } from "constants/chart-types"

const maxLayersConfig = getFeatureFlag(available_feature_flags.MAX_MAP_LAYERS)
const MAX_NUM_LAYERS = maxLayersConfig === -1 ? Infinity : maxLayersConfig

export default function LayerPicker(props) {
  const { saveCurrentLayer, id, currentLayer: mountLayer } = props

  useEffect(() => {
    saveCurrentLayer(id, mountLayer)
  }, [saveCurrentLayer, id, mountLayer])

  const showMaster = () => props.showMaster(props.id, props.currentLayer)

  const [layerLabelEditable, setLayerLabelEditable] = useState(false)
  const [layerEditableError, setLayerEditableError] = useState("")

  const namesRef = useRef(null)

  function getMap() {
    if (!namesRef.current) {
      namesRef.current = new Map()
    }
    return namesRef.current
  }

  const editLayerLabel = (i) => {
    const map = getMap()
    const node = map.get(i)
    setLayerLabelEditable(!layerLabelEditable)
    if (layerLabelEditable) {
      const {
        chart: { currentLayer = 0 }
      } = props
      props.setLayerLabel(props.id, currentLayer, node.textContent)
    }

    if (!layerLabelEditable && window.getSelection) {
      setTimeout(() => {
        node.focus()
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        selection.removeAllRanges()
        selection.addRange(range)
      }, 0)
    }
  }

  const renameLayername = (labelText) => {
    const {
      chart: { currentLayer = 0, layers }
    } = props
    const otherLayers = layers.filter((layer, index) => index !== currentLayer)
    // test to see if label is same as any other layer label
    if (otherLayers.some((layer) => layer.labelText === labelText.trim())) {
      setLayerEditableError("The layer name must be unique")
    } else {
      props.setLayerLabel(props.id, currentLayer, labelText)
      setLayerEditableError("")
      setLayerLabelEditable(false)
    }
  }

  const deleteLayer = (layerId) => () => {
    props.dispatch(
      showModal({
        heading: "Delete Layer",
        content: "Delete this layer?",
        primaryAction: {
          action: () => {
            props.deleteLayer(props.id, layerId)
            props.dispatch(hideModal())
          },
          text: "OK"
        },
        secondaryAction: {
          action: () => props.dispatch(hideModal()),
          text: "CANCEL"
        }
      })
    )
  }

  const addLayer = () =>
    props.addLayer(props.id, props.currentLayer, props.chart?.type)

  const switchLayer = (layerId) => () => {
    const {
      chart: { currentLayer = 0 }
    } = props
    if (layerId !== currentLayer) {
      props.switchLayer(props.id, layerId, currentLayer)
    }
  }

  const showEnterprisePrompt = () => {}

  const showMasterLayer = () => {
    const { chart, layers = [], currentLayer = 0 } = props
    const validLayers = layers.filter(isLayerValid)
    return (
      validLayers.length > 1 ||
      (currentLayer === 1 && isLayerValid(layers[0]) && isLayerValid(chart))
    )
  }

  const { chart, layers = [], currentLayer = 0, layersEnabled } = props

  const onKeyBoardEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      renameLayername(e.currentTarget.textContent)
    }
  }

  const chartSupportsNumLayers = () => {
    const chartDef = CHART_DEFS[chart.type]
    return (
      // Does not specify, allow max from feature flags
      !chartDef?.hasOwnProperty("supportedNumLayers") ||
      // if specified, make sure we're under the specified number
      layers.length < CHART_DEFS[chart.type].supportedNumLayers
    )
  }

  const addLayerEnabled =
    layers.length < MAX_NUM_LAYERS && chartSupportsNumLayers()

  return (
    <div className="layer-picker">
      <div className="layer-tabs-wrapper">
        {showMasterLayer() && (
          <div
            className={cx("layer-tab", { active: currentLayer === "master" })}
          >
            <button
              className={"button layer master"}
              onClick={layersEnabled ? showMaster : showEnterprisePrompt}
            >
              <Icon name="layers" />
              {"Master"}
            </button>
          </div>
        )}
        {layers.map((layer, i) => {
          const layerLabel = layer.labelText || `Layer ${i + 1}`
          return (
            <div
              className={cx("layer-tab", { active: currentLayer === i })}
              key={i}
            >
              <button
                className={"button layer"}
                key={i}
                onClick={layersEnabled ? switchLayer(i) : showEnterprisePrompt}
              >
                <div className="layer-label-wrapper">
                  <Tooltip
                    content={layerEditableError}
                    open={
                      currentLayer === i &&
                      layerLabelEditable &&
                      layerEditableError
                    }
                    showArrow
                    align="bottom"
                    activateOn="focus"
                  >
                    <div
                      className={cx("layer-label-text", {
                        "layer-label-text-editable":
                          currentLayer === i && layerLabelEditable,
                        "layer-label-text-editable-error":
                          currentLayer === i &&
                          layerLabelEditable &&
                          layerEditableError
                      })}
                      contentEditable={currentLayer === i && layerLabelEditable}
                      suppressContentEditableWarning
                      ref={(node) => {
                        const map = getMap()
                        if (node) {
                          map.set(i, node)
                        } else {
                          map.delete(i)
                        }
                      }}
                      onKeyPress={onKeyBoardEnter}
                      title={layer.labelText || `Layer ${i + 1}`}
                      onBlur={(e) => {
                        renameLayername(e.currentTarget.textContent)
                      }}
                    >
                      {layerLabel}
                    </div>
                  </Tooltip>
                </div>
              </button>
              {layers.length > 1 && (
                <button
                  className={"button remove-layer"}
                  onClick={
                    layersEnabled ? deleteLayer(i) : showEnterprisePrompt
                  }
                >
                  <Icon name="x" />
                </button>
              )}
              {currentLayer === i && !layerLabelEditable && (
                <button
                  className={"button rename-layer"}
                  onClick={
                    layersEnabled
                      ? () => editLayerLabel(i)
                      : showEnterprisePrompt
                  }
                >
                  <IconEdit
                    className={cx(
                      "layer-edit-icon layer-set-item__button--edit"
                    )}
                    icon="edit"
                  />
                </button>
              )}
            </div>
          )
        })}
        {addLayerEnabled && (
          <button
            className={cx("button add-layer", {
              disabled: chart.dcFlag === null
            })}
            onClick={layersEnabled ? addLayer : showEnterprisePrompt}
          >
            {"+ Add Layer"}
          </button>
        )}
      </div>
    </div>
  )
}

LayerPicker.propTypes = {
  addLayer: PropTypes.func.isRequired,
  chart: chartShape.isRequired,
  currentLayer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deleteLayer: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      active: PropTypes.bool,
      dataSource: PropTypes.string,
      measures: PropTypes.array,
      dimensions: PropTypes.array
    })
  ),
  layersEnabled: PropTypes.bool,
  saveCurrentLayer: PropTypes.func.isRequired,
  showMaster: PropTypes.func.isRequired,
  switchLayer: PropTypes.func.isRequired,
  setLayerLabel: PropTypes.func.isRequired
}
