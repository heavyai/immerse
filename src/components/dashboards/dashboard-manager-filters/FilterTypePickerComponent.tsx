// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import DashboardManagerFiltersSimpleSelect from "./DashboardManagerFiltersSimpleSelect"
import Popover from "../../popover/popover"
import PlusIcon from "../../svg-icons/icon-plus"
import { SelectOption } from "dashboard-manager-filter-types"

const filterTypes = [
  { value: "title", label: "Title" },
  { value: "is_shared", label: "Is shared" },
  { value: "owner", label: "Owner" },
  { value: "source", label: "Source" },
  { value: "last_modified", label: "Last modified" }
]

export const filterTypesMap = {
  title: "dashboard_name",
  is_shared: "is_dash_shared",
  owner: "dashboard_owner",
  source: "tableName",
  last_modified: "update_time"
}

type Props = {
  setFilterType: (selectedFilterType) => void
}
const FilterTypePickerComponent: FC<Props> = ({ setFilterType }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const handleCloseDropdown = () => {
    setMenuIsOpen(false)
  }

  const onSelectOption = (option: SelectOption) => {
    setFilterType(option)
    setMenuIsOpen(false)
  }

  return (
    <>
      <div
        className="add-dashboard-mngr-filter-type"
        data-testid={"add-dashboard-mngr-filter-type"}
        onClick={() => setMenuIsOpen(!menuIsOpen)}
      >
        <PlusIcon />
      </div>
      {menuIsOpen && (
        <Popover isOpened onClose={handleCloseDropdown}>
          <DashboardManagerFiltersSimpleSelect
            options={filterTypes}
            selectOption={onSelectOption}
          />
        </Popover>
      )}
    </>
  )
}

export default FilterTypePickerComponent
