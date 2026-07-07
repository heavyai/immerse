#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0



if [[ -d .servers ]]; then

  if [ "$1" != "" ]; then

    if [[ -e ".servers/$1.json" ]]; then

      rm ".servers/$1.json"
      echo "$1 removed"

    else
      echo "No server with name $1"
    fi

  else
    echo "Name the server to remove - e.g., npm run s:remove demo-server"
    exit 1
  fi

else
  echo "No .servers directory found in current directory"
  exit 1
fi
