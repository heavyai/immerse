// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import Icon from "components/icon/icon"
import React from "react"

const AccountPanelAnchor = ({ isOpen, onToggleOpen }) => (
  <div
    {...{
      id: "user-dropdown",
      "data-test-id": "account-panel",
      className: cx("button user-dropdown-display", {
        active: isOpen
      }),
      onClick: onToggleOpen
    }}
  >
    <Icon name={"default-user"} viewBox="2 2 20 20" />
  </div>
)

export default AccountPanelAnchor
