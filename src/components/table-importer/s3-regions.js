// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const concatIfDefined = (array1, array2) =>
  array2 ? array1.concat(array2) : array1

const parseAndConvertAdditionalRegions = (jsonString) => {
  try {
    const regions = JSON.parse(jsonString)
    return regions.map((region) => ({ value: region[0], label: region[1] }))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid AWS Region formatting in feature flag")
    return undefined
  }
}

// Current valid regions can be found at https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region

// 'value' is what will be displayed -
// This list is passed as 'options' prop to components/autocomplete
const regions = [
  {
    value: "US East (Ohio)",
    label: "us-east-2"
  },
  {
    value: "US East (N. Virginia)",
    label: "us-east-1"
  },
  {
    value: "US West (N. California)",
    label: "us-west-1"
  },
  {
    value: "US West (Oregon)",
    label: "us-west-2"
  },
  {
    value: "Canada (Central)",
    label: "ca-central-1"
  },
  {
    value: "Asia Pacific (Mumbai)",
    label: "ap-south-1"
  },
  {
    value: "Asia Pacific (Seoul)",
    label: "ap-northeast-2"
  },
  {
    value: "Asia Pacific (Osaka-Local)",
    label: "ap-northeast-3"
  },
  {
    value: "Asia Pacific (Singapore)",
    label: "ap-southeast-1"
  },
  {
    value: "Asia Pacific (Sydney)",
    label: "ap-southeast-2"
  },
  {
    value: "Asia Pacific (Tokyo)",
    label: "ap-northeast-1"
  },
  {
    value: "China (Beijing)",
    label: "cn-north-1"
  },
  {
    value: "China (Ningxia)",
    label: "cn-northwest-1"
  },
  {
    value: "EU (Frankfurt)",
    label: "eu-central-1"
  },
  {
    value: "EU (Ireland)",
    label: "eu-west-1"
  },
  {
    value: "EU (London)",
    label: "eu-west-2"
  },
  {
    value: "EU (Paris)",
    label: "eu-west-3"
  },
  {
    value: "South America (São Paulo)",
    label: "sa-east-1"
  }
]

// Additional regions defined through feature flag
const additionalRegions = getFeatureFlag(available_feature_flags.AWS_REGIONS)
const convertedAdditionalRegions = additionalRegions
  ? parseAndConvertAdditionalRegions(additionalRegions)
  : undefined

export default concatIfDefined(regions, convertedAdditionalRegions)
