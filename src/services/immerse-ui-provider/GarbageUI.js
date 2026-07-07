// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { SecondaryButton } from "widgets/button/Button"
import { Switch } from "widgets/switch/Switch"
import { useImmerseUIContext } from "./ImmerseUIContext"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const GarbageUI = () => {
  const {
    immerseUIKeys = {},
    immerseUIKeyActions: {
      setImmerseUIKey,
      enableAllImmerseUIKeys,
      disableAllImmerseUIKeys
    }
  } = useImmerseUIContext()

  const [selectedUI, setSelectedUI] = useState(
    Object.keys(immerseUIKeys).sort()[0]
  )

  if (!getFeatureFlag(available_feature_flags.IMMERSE_UI_PROVIDER_DEMO_UI)) {
    return null
  }

  const keyOptions = Object.keys(immerseUIKeys)
    .sort()
    .map((key) => ({
      label: `${key} [${immerseUIKeys[key] ? "ON" : "OFF"}]`,
      value: key
    }))

  return (
    <div
      className="immerse-ui-provider-demo"
      style={{
        position: "absolute",
        right: 5,
        bottom: 5,
        border: "1px solid white",
        zIndex: 500,
        whiteSpace: "nowrap",
        // width: "350px",
        display: "flex",
        padding: "7px"
      }}
    >
      <div style={{ width: "280px" }}>
        <MultiSelect
          value={keyOptions.find((option) => option.value === selectedUI)}
          placeholder={"Keys"}
          options={keyOptions}
          onChange={(option) => setSelectedUI(option.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "5px"
        }}
      >
        <Switch
          checked={immerseUIKeys[selectedUI]}
          onChange={(e) => setImmerseUIKey(selectedUI, e.target.checked)}
        />
      </div>
      <div style={{ marginLeft: "15px" }}>
        <SecondaryButton onClick={enableAllImmerseUIKeys} label="ALL ON" />
        <SecondaryButton onClick={disableAllImmerseUIKeys} label="ALL OFF" />
      </div>
    </div>
  )
}

export default GarbageUI
