// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import cx from "classnames"
import React, { ReactComponentElement } from "react"
import { Link } from "react-router-dom"
import { generatePath, useRouteMatch } from "react-router"
import { Tooltip } from "@rmwc/tooltip"
import { Icon } from "@rmwc/icon"

import SupportedFilesTooltipCategory from "./supported-files-tooltip-category"

import "./importer-tile.scss"

const ImporterTile = ({
  icon,
  label,
  supportedFiles = {},
  importerKey
}: {
  icon: ReactComponentElement<any>
  label: string
  importerKey: string
}) => {
  const routeMatch = useRouteMatch() as {
    params: { [paramName: string]: string }
    path: string
  }

  const { connectorType: _, ...restParams } = routeMatch.params
  const selectorRootPath = generatePath(routeMatch.path, restParams)

  return (
    <Link to={`${selectorRootPath}/${importerKey}`}>
      <li
        className={cx(
          `import-table__option`,
          `import-table__options__${importerKey}`
        )}
        data-testid={`connector-${importerKey}`}
      >
        <div className="import-table__option__icon">{icon}</div>
        <p>{label}</p>

        {Boolean(Object.keys(supportedFiles).length) && (
          <Tooltip
            showArrow
            align="right"
            className="supported-files-tooltip"
            content={
              <div className="supported-files-content">
                {Object.keys(supportedFiles).map((fileType) => (
                  <SupportedFilesTooltipCategory
                    category={supportedFiles[fileType].label}
                    extensions={supportedFiles[fileType].extensions}
                    icon={supportedFiles[fileType].icon}
                    key={fileType}
                  />
                ))}
              </div>
            }
          >
            <div className="supported-files-label">
              <Icon icon="info" />
              Supported file types
            </div>
          </Tooltip>
        )}
      </li>
    </Link>
  )
}

export default ImporterTile
