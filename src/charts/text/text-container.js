// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import TextComponent from "./text-component"
import { updateText } from "./text-action-creators"

export function mapStateToProps({ charts, chartEditor }, { id }) {
  const chartState = charts[id]
  return {
    id,
    isEditable: chartEditor.editing,
    text: chartState.text || "",
    wasCancelled: chartEditor.wasCancelled,
    wasApplied: chartEditor.wasApplied,
    fontColorPalette: chartState.color.val
  }
}

export const mapDispatchToProps = {
  updateText
}

export default connect(mapStateToProps, mapDispatchToProps)(TextComponent)
