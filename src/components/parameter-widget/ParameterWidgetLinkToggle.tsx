// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import IconLinkOff from "components/svg-icons/icon-link-off"
import React from "react"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"
import { noop } from "../../utils/helpers"

type Props = {
  linked: boolean
  toggleLinked: () => void
  disabled: boolean
}

const ParameterWidgetLinkToggle = ({
  linked,
  toggleLinked,
  disabled = false
}: Props) => {
  return (
    <div
      {...{
        className: `parameter-widget__link ${disabled ? "disabled" : ""}`
      }}
    >
      <Tooltip
        enterDelay={500}
        content={
          linked
            ? "This value is synced across tabs"
            : "This value is local to this tab"
        }
      >
        <div
          className={cx({
            "parameter-widget__link__icon--unlinked": !linked,
            "parameter-widget__link__icon--linked": linked
          })}
          onClick={disabled ? noop : toggleLinked}
        >
          {linked ? <Icon icon="link" /> : <IconLinkOff />}
        </div>
      </Tooltip>
    </div>
  )
}

export default ParameterWidgetLinkToggle
