// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { noop } from "../../utils/helpers"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"
import React from "react"

export const ShowHideButton = ({ hide = false, onClick = noop }) => (
  <Tooltip
    {...{
      content: <span>{`${hide ? "Show" : "Hide"} this parameter`}</span>,
      enterDelay: 500
    }}
  >
    <div
      {...{
        className: "show-hide-button"
      }}
    >
      {hide ? (
        <Icon
          {...{
            icon: "visibility_off",
            onClick
          }}
        />
      ) : (
        <Icon
          {...{
            icon: "visibility",
            onClick
          }}
        />
      )}
    </div>
  </Tooltip>
)
