// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import moment from "moment"
import numeral from "numeral"
import Highlighter from "react-highlight-words"
import { Icon } from "@rmwc/icon"

import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import IconGeoPin from "components/svg-icons/icon-geo-pin"

import { DataCatalogItem } from "./types"

type Props = {
  catalogItem: DataCatalogItem
  search: string
  onSelect: (item: DataCatalogItem) => void
  onConnect: (item: DataCatalogItem) => void
  serverURL: string
}

const DataCatalogCard: FC<Props> = ({
  catalogItem,
  search,
  onSelect,
  serverURL,
  onConnect
}) => {
  const onClickImport = () => {
    onSelect(catalogItem)
  }

  const onClickConnect = () => {
    onConnect(catalogItem)
  }

  const filesize = numeral(catalogItem.byteCount).format("0b")
  const rowCount = numeral(catalogItem.rowCount).format("0,0")
  const lastUpdate = moment(catalogItem.lastUpdate).utc().format("MMM D, YYYY")

  const isInSearch =
    !search ||
    catalogItem.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())

  // Connect button should be hidden (out of 6.0 scope)
  const showConnectButton = false

  return (
    <div className={`data-catalog-card${isInSearch ? "" : " hidden"}`}>
      <div
        className="data-catalog-card-header"
        style={
          catalogItem.localImageFilename
            ? {
                backgroundImage: `url('${serverURL}/data-catalog/${catalogItem.localImageFilename}')`
              }
            : catalogItem.imageURL && {
                backgroundImage: `url('${catalogItem.imageURL}')`
              }
        }
      >
        <div className="data-catalog-name-tag">
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={catalogItem.name}
            highlightClassName="data-catalog-name-highlight"
          />
        </div>
      </div>
      <div className="data-catalog-card-body">
        <div className="info-list-primary">
          <div className="entry-key">File Size</div>
          <div className="entry-value">{filesize}</div>
          <div className="entry-key">Rows</div>
          <div className="entry-value">{rowCount}</div>
          <div className="entry-key">Columns</div>
          <div className="entry-value">{catalogItem.columnCount}</div>
          {catalogItem.hasGeo && (
            <>
              <div className="entry-key">Contains</div>
              <div className="entry-value">
                Geo <IconGeoPin className="geo-pin-icon" />
              </div>
            </>
          )}
        </div>
        <div className="info-list-secondary">
          <div className="entry-key">Last updated</div>
          <div className="entry-value">{lastUpdate}</div>
        </div>
      </div>
      <div className="data-catalog-card-footer">
        <div className="button-container">
          {showConnectButton ? (
            <SecondaryButton onClick={onClickImport}>Import</SecondaryButton>
          ) : (
            <PrimaryButton onClick={onClickImport}>Import</PrimaryButton>
          )}
          {showConnectButton && (
            <PrimaryButton
              onClick={onClickConnect}
              trailingIcon={<Icon icon="info" size="small" />}
            >
              Connect
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataCatalogCard
