// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import FormattingSettings from "components/chart-settings/vega-combo/components/data-formatting-components/formatting-settings"
import DataSettings from "components/chart-settings/vega-combo/components/data-formatting-components/data-settings"
import FoldySection from "components/chart-settings/vega-combo/components/widgets/foldy-section"

interface Props {
  chartId: string
}

const DataFormattingSettings: FC<Props> = ({ chartId }) => (
  <>
    <FoldySection label="Data Settings">
      <DataSettings chartId={chartId} />
    </FoldySection>
    <FoldySection label="Formatting Settings">
      <FormattingSettings chartId={chartId} />
    </FoldySection>
  </>
)

export default DataFormattingSettings
