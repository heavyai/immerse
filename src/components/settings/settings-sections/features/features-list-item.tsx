// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { RenderTypeInput } from "components/control-panel/feature-flag-inputs"
import { FlagDefinition } from "components/settings/settings-sections/features/types"

const FeaturesListItem = ({
  definition,
  flagValues,
  updateState
}: {
  definition: FlagDefinition
  flagValues: Record<string, any>
  updateState: (val: any) => void
}) => {
  return (
    <li key={definition.key} className="feature-settings__list__item">
      <div>
        <p className="feature-settings__list__item__label">{definition.key}</p>
        <p className="feature-settings__list__item__description">
          {definition.description}
        </p>
      </div>

      <div className="feature-settings__list__item__input">
        <RenderTypeInput
          def={definition}
          values={flagValues}
          callback={updateState}
          disabled
        />
      </div>
    </li>
  )
}

export default FeaturesListItem
