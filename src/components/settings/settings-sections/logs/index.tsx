// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import LinkCardGrid from "components/settings/link-card-grid"
import IconLog from "components/svg-icons/icon-log"
import IconLogWarning from "components/svg-icons/icon-log-warning"
import IconLogInfo from "components/svg-icons/icon-log-info"
import IconLogError from "components/svg-icons/icon-log-error"
import { IQ_LOG_DESCRIPTIONS, LOG_DESCRIPTIONS } from "constants/text"
import serverUrl from "constants/app-config"
import { useHeavyIQAvailable } from "hooks/useHeavyIQAvailable"

const LOGS_LINKS_META = [
  {
    label: "Access Logs",
    url: `${serverUrl.url}/logs/access`,
    icon: <IconLog />,
    description: LOG_DESCRIPTIONS.access
  },
  {
    label: "All Logs",
    url: `${serverUrl.url}/logs/all`,
    icon: <IconLog />,
    description: LOG_DESCRIPTIONS.all
  },
  {
    label: "Error Logs",
    url: `${serverUrl.url}/logs/error`,
    icon: <IconLogError />,
    description: LOG_DESCRIPTIONS.error
  },
  {
    label: "Info Logs",
    url: `${serverUrl.url}/logs/info`,
    icon: <IconLogInfo />,
    description: LOG_DESCRIPTIONS.info
  },
  {
    label: "Warning Logs",
    url: `${serverUrl.url}/logs/warning`,
    icon: <IconLogWarning />,
    description: LOG_DESCRIPTIONS.warning
  }
]
const IQ_LOGS_META = [
  {
    label: "IQ Access Logs",
    url: `${serverUrl.url}/logs/iq/access`,
    icon: <IconLog />,
    description: IQ_LOG_DESCRIPTIONS.access
  },
  {
    label: "IQ All Logs",
    url: `${serverUrl.url}/logs/iq/all`,
    icon: <IconLog />,
    description: IQ_LOG_DESCRIPTIONS.all
  },
  {
    label: "IQ Console Logs",
    url: `${serverUrl.url}/logs/iq/console`,
    icon: <IconLog />,
    description: IQ_LOG_DESCRIPTIONS.console
  },
  {
    label: "IQ Build Logs",
    url: `${serverUrl.url}/logs/iq/build`,
    icon: <IconLog />,
    description: IQ_LOG_DESCRIPTIONS.build
  },
  {
    label: "IQ Guidance Logs",
    url: `${serverUrl.url}/logs/iq/guidance`,
    icon: <IconLog />,
    description: IQ_LOG_DESCRIPTIONS.guidance
  }
]

const Logs = () => {
  const [loading, available] = useHeavyIQAvailable()

  const allLogLinks = useMemo(() => {
    if (!loading && available === true) {
      return [...LOGS_LINKS_META, ...IQ_LOGS_META]
    } else {
      return LOGS_LINKS_META
    }
  }, [loading, available])
  return (
    <div>
      <header className="settings__content__header">
        <h1>Log Files</h1>
        <p>{LOG_DESCRIPTIONS.heading}</p>
      </header>
      <LinkCardGrid
        linkMeta={allLogLinks.map((meta) => ({
          ...meta,
          linkText: "View Log"
        }))}
      />
    </div>
  )
}

export default Logs
