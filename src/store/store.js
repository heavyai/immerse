// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createStoreWithServices from "./create-store-with-services"
import Services from "services/immerse"
import rootReducer from "reducers"
import { populateImportableStore } from "./importableStore"

// never -ever- import store if you're not in the AppRoot.
// use store/importableStore instead.
const store = createStoreWithServices({}, Services, rootReducer)
populateImportableStore(store)

export default store
