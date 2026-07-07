// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  I'm still not stoked about how these def files are defined.

  For addons, vs charts, let the addon itself just handle the registration. All we're doing here is importing
  the individual files so we do the individual registry calls.

  Maybe refactor to a better pattern?
*/

import "./crossfilter-replay"
import "./export-as-image"
