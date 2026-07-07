// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Icon } from "@rmwc/icon"

import { TextField } from "widgets/text-field/TextField"
import { Switch } from "widgets/switch/Switch"

import IconGeoPin from "components/svg-icons/icon-geo-pin"

const ImportDataCatalogFilters = ({
  search,
  setSearch,
  onlyGeo,
  setOnlyGeo
}: {
  search: string
  setSearch: (search: string) => void
  onlyGeo: boolean
  setOnlyGeo: (onlyGeo: boolean) => void
}) => {
  const onSearchChange = (event: React.FormEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value)
  }

  const clearSearch = () => {
    setSearch("")
  }

  const onOnlyGeoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyGeo(event.currentTarget.checked)
  }

  return (
    <div className="search-container">
      <TextField
        className="search-input"
        placeholder={"SEARCH"}
        value={search}
        onChange={onSearchChange}
        icon={<Icon icon="search" size="small" />}
        trailingIcon={{
          icon: search.length > 0 ? "close" : "",
          onClick: clearSearch
        }}
        outlined={false}
      />
      <div className="only-geo-toggle-container">
        Contains Geo
        <IconGeoPin className="geo-pin-icon" />
        <Switch
          className="only-geo-toggle"
          checked={onlyGeo}
          onChange={onOnlyGeoChange}
        />
      </div>
    </div>
  )
}

export default ImportDataCatalogFilters
