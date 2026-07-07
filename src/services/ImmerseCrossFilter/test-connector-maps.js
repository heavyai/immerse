// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const queryMap = {
  "this is a fake query": [],
  "this is another fake query": [],
  "SELECT COUNT(*) AS n FROM test_table": [{ n: 5 }],
  "SELECT COUNT(*) AS val FROM test_table": [{ val: 5 }],
  "SELECT MIN(colA) AS COLA FROM test_table WHERE colC = 'C-global-val-1'": [
    { COLA: 1 }
  ],
  "SELECT MIN(colA) AS COLA FROM test_table": [{ COLA: 0 }],
  "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA ASC  LIMIT 50 OFFSET 0": [
    { colA: "A1" },
    { colA: "A2" },
    { colA: "A3" },
    { colA: "A4" },
    { colA: "A5" }
  ],
  "SELECT colA FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' ORDER BY test_table.colA DESC  LIMIT 50 OFFSET 0": [
    { colA: "A5" },
    { colA: "A4" },
    { colA: "A3" },
    { colA: "A2" },
    { colA: "A1" }
  ],
  "SELECT COUNT(*) AS n FROM test_table WHERE colC = 'C-global-val-1'": [
    { n: 5 }
  ],
  "SELECT COUNT(*) AS val FROM test_table WHERE colC = 'C-global-val-1'": [
    { val: 5 }
  ],
  "SELECT MIN(test_table.colA) AS min_val, MAX(test_table.colA) AS max_val FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1'": [
    { min_val: 3, max_val: 7 }
  ],
  "SELECT test_table.colA AS key0,COUNT(*) AS val  FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' GROUP BY key0 ORDER BY val DESC NULLS LAST LIMIT 50 OFFSET 0": [
    { key0: "A5", val: 50 },
    { key0: "A4", val: 40 },
    { key0: "A3", val: 30 },
    { key0: "A2", val: 20 },
    { key0: "A1", val: 10 }
  ],
  "SELECT test_table.colA AS key0,COUNT(*) AS val  FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' GROUP BY key0 ORDER BY val ASC NULLS LAST LIMIT 50 OFFSET 0": [
    { key0: "A1", val: 10 },
    { key0: "A2", val: 20 },
    { key0: "A3", val: 30 },
    { key0: "A4", val: 40 },
    { key0: "A5", val: 50 }
  ],
  "SELECT test_table.colA AS key0,COUNT(*) AS val  FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' GROUP BY key0 ORDER BY key0 ASC": [
    { key0: "A1", val: 10 },
    { key0: "A2", val: 20 },
    { key0: "A3", val: 30 },
    { key0: "A4", val: 40 },
    { key0: "A5", val: 50 }
  ],
  "SELECT test_table.colA AS key0,COUNT(*) AS val  FROM test_table WHERE colA = 'A-val-1' AND colB = 'B-val-1' AND colC = 'C-global-val-1' GROUP BY key0 ORDER BY key0": [
    { key0: "A1", val: 10 },
    { key0: "A2", val: 20 },
    { key0: "A3", val: 30 },
    { key0: "A4", val: 40 },
    { key0: "A5", val: 50 }
  ],
  'SELECT COUNT(*) AS val FROM "test_pointmap_table_1" INNER JOIN "test_table" ON ("test_pointmap_table_1"."ljk" = "test_table"."rjk")': [
    { val: 5 }
  ]
}

export const fieldsMap = {
  test_table: {
    row_desc: [
      {
        col_name: "colA",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "colB",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      },
      {
        col_name: "colC",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 3
      },
      {
        col_name: "colD",
        col_type: {
          type: 3,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 5
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "colA",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "colB",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colC",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colD",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      }
    ]
  },
  test_pointmap_table_1: {
    row_desc: [
      {
        col_name: "latA",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "lonA",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      },
      {
        col_name: "colA",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 3
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "latA",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "lonA",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colA",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: false
      }
    ]
  },
  test_pointmap_table_2: {
    row_desc: [
      {
        col_name: "latB",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "lonB",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      },
      {
        col_name: "colB",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "latB",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "lonB",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colB",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true
      }
    ]
  },
  test_scatter_table: {
    row_desc: [
      {
        col_name: "x",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "y",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "x",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "y",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: true
      }
    ]
  },
  join_table_1: {
    row_desc: [
      {
        col_name: "colA",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "colB",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      },
      {
        col_name: "colC",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 3
      },
      {
        col_name: "colD",
        col_type: {
          type: 3,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 5
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "colA",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "colB",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colC",
        type: "STR",
        precision: 0,
        is_array: false,
        is_dict: true
      },
      {
        name: "colD",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      }
    ]
  },
  join_table_2: {
    row_desc: [
      {
        col_name: "latA",
        col_type: {
          type: 6,
          encoding: 0,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 0,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 1
      },
      {
        col_name: "lonA",
        col_type: {
          type: 6,
          encoding: 4,
          nullable: true,
          is_array: false,
          precision: 0,
          scale: 0,
          comp_param: 32,
          size: -1
        },
        is_reserved_keyword: false,
        src_name: "",
        is_system: false,
        is_physical: false,
        col_id: 2
      }
    ],
    fragment_size: 32000000,
    page_size: 2097152,
    max_rows: 4611686018427388000,
    view_sql: "",
    shard_count: 0,
    key_metainfo: "[]",
    is_temporary: false,
    partition_detail: 0,
    columns: [
      {
        name: "latA",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: false
      },
      {
        name: "lonA",
        type: "FLOAT",
        precision: 0,
        is_array: false,
        is_dict: true
      }
    ]
  }
}
