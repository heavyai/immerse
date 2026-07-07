#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0



if mkdir -p .servers; then

  if [ "$1" != "" ]; then

    if [[ -e src/servers.local.json ]]; then

      cp src/servers.local.json ".servers/$1.json"
      echo "$1 added"

    else
      echo "No src/servers.local.json found"
      exit 1
    fi

  else
    echo "Give a name to your new server - e.g., npm run s:add demo-server"
    exit 1
  fi

else
  echo "Unable to create .servers directory"
  exit 1
fi
