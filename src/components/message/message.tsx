// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import classNames from "classnames"
import { Icon } from "@rmwc/icon"

import "./message.scss"

export enum MESSAGE_TYPES {
  ERROR = "ERROR",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  NONE = "NONE"
}

const messageIcons = {
  [MESSAGE_TYPES.SUCCESS]: <Icon icon="check_circle_outline" />,
  [MESSAGE_TYPES.ERROR]: <Icon icon="error_outline" />,
  [MESSAGE_TYPES.INFO]: <Icon icon="info_outline" />,
  [MESSAGE_TYPES.NONE]: <Icon icon="info_outline" />,
  [MESSAGE_TYPES.WARNING]: <Icon icon="warning_outline" />
}

export const Message = ({
  type = MESSAGE_TYPES.NONE,
  message,
  className
}: {
  type?: MESSAGE_TYPES
  message: string | null
  className?: string
}) => {
  return (
    <div
      className={classNames("message", className, {
        "message-success": type === MESSAGE_TYPES.SUCCESS,
        "message-error": type === MESSAGE_TYPES.ERROR,
        "message-info": type === MESSAGE_TYPES.INFO,
        "message-warning": type === MESSAGE_TYPES.WARNING
      })}
    >
      <div className="message-icon">{messageIcons[type]}</div>
      <div className="message-text">{message}</div>
    </div>
  )
}
