#!/bin/bash
# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0



if [[ -d .servers ]]; then

  if [ "$1" != "" ]; then

    if [[ -e ".servers/$1.json" ]]; then

      cp src/servers.local.json .servers/servers.local.json.bak
      cp ".servers/$1.json" src/servers.local.json

      echo "Switched to $1"

    else
      echo "No server with name $1"
      exit 1
    fi

  else

    if [[ -e .servers/servers.local.json.bak ]]; then

      if [[ -e src/servers.local.json ]]; then

        mv src/servers.local.json .servers/servers.local.json.bak~
        mv .servers/servers.local.json.bak src/servers.local.json
        mv .servers/servers.local.json.bak~ .servers/servers.local.json.bak

        echo "Swapped to last used server"
      
      else

        mv .servers/servers.local.json.bak src/servers.local.json

        echo "Restored last used server"

      fi

    else

      echo "No last used server. To switch to a server, pass a name - e.g., npm run s:switch demo-server"
      exit 1

    fi

  fi

else
  echo "No .servers directory found in current directory"
  exit 1
fi
