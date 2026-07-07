#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0



if [[ -d .servers ]]; then

  for filepath in .servers/*.json; do
    if [[ -e "$filepath" ]]; then
      filename=${filepath##*/}
      basename=${filename%.json}
      echo "$basename"
    fi
  done

else
  echo "No .servers directory found in current directory"
  exit 1
fi
