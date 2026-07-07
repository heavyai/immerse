// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react"

type ListVal = string | string[]
type ListItem = Record<string, ListVal>

export const useSearchableList = (
  fullList: ListItem[],
  searchableProperties: string[]
) => {
  const [searchTerm, setSearchTerm] = useState("")

  return {
    filteredList:
      searchTerm === ""
        ? fullList
        : fullList.filter((listItem) =>
            searchableProperties.some((property) => {
              const lowerSearchTerm = searchTerm.toLowerCase()
              return Array.isArray(listItem[property])
                ? listItem[property].some((listProperty) =>
                    listProperty.toLowerCase().includes(lowerSearchTerm)
                  )
                : listItem[property].toLowerCase().includes(lowerSearchTerm)
            })
          ),
    setSearchTerm,
    searchTerm
  }
}
