// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setParameterValue } from "components/parameters/actions/parameter-values-action-creators"
import { getDataSourcesList as importedDataSourcesList } from "./tables-datasources-list-action-creators"

export const getDataSourcesList = () =>
  importedDataSourcesList(setParameterValue)
