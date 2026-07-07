// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { FlagDefinition } from "components/settings/settings-sections/features/types"
import FeaturesListItem from "./features-list-item"

const FeaturesList = ({
  features,
  ...restProps
}: {
  features: FlagDefinition[]
}) => {
  return (
    <ul className="feature-settings__list">
      {features.length === 0 ? (
        // TODO Replace with TBD real copy
        <div className="no-flags">No results for search term</div>
      ) : (
        features.map((definition) => (
          <FeaturesListItem
            {...restProps}
            key={definition.key}
            definition={definition}
          />
        ))
      )}
    </ul>
  )
}

export default FeaturesList
