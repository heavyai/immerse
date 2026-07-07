// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import FEATUREFLAG_DEFINITIONS from "components/control-panel/featureflag-definitions.json"
import IconFlask from "components/svg-icons/icon-flask"

export const MOCK_GROUPS = {
  A: "GroupA",
  B: "GroupB",
  C: "GroupC",
  D: "GroupD"
}

const MOCK_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempory."

export const featureGroups = [
  {
    value: MOCK_GROUPS.A,
    label: "Beta",
    description: MOCK_DESCRIPTION,
    icon: <IconFlask />
  },
  {
    value: MOCK_GROUPS.B,
    label: "UX",
    description: MOCK_DESCRIPTION,
    icon: <IconFlask />
  },
  {
    value: MOCK_GROUPS.C,
    label: "Combo",
    description: MOCK_DESCRIPTION,
    icon: <IconFlask />
  },
  {
    value: MOCK_GROUPS.D,
    label: "Dev",
    description: MOCK_DESCRIPTION,
    icon: <IconFlask />
  }
]

export const mockFeaturesDefinitions = [
  ...FEATUREFLAG_DEFINITIONS.slice(0, 20).map((def) => ({
    ...def,
    userFacingGroup: MOCK_GROUPS.A
  })),
  ...FEATUREFLAG_DEFINITIONS.slice(20, 45).map((def) => ({
    ...def,
    userFacingGroup: MOCK_GROUPS.B
  })),
  ...FEATUREFLAG_DEFINITIONS.slice(45, 50).map((def) => ({
    ...def,
    userFacingGroup: MOCK_GROUPS.C
  })),
  ...FEATUREFLAG_DEFINITIONS.slice(50, 59).map((def) => ({
    ...def,
    userFacingGroup: MOCK_GROUPS.D
  }))
]

export const getGroupedFlags = () => {
  const ungroupedFlags = mockFeaturesDefinitions
  const sortedFlags = {}
  ungroupedFlags.forEach((flag) => {
    if (sortedFlags[flag.userFacingGroup]) {
      sortedFlags[flag.userFacingGroup].push(flag)
    } else {
      sortedFlags[flag.userFacingGroup] = [flag]
    }
  })

  return sortedFlags
}
