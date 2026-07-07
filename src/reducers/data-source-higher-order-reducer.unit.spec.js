// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import reducer from "./data-source-higher-order-reducer"

const identity = a => a

describe("data-source-higher-order-reducer", () => {
  it("should handle adding datasources to layers", () => {
    const state = {
      dashboard: {
        currentDataSource: "acled",
        dataSources: {
          acled: {
            alias: "A",
            columnMetadata: ["test"]
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "acled",
          hoverSelectedColumns: [{}],
          layers: {
            0: {
              dataSource: "acled"
            },
            1: {}
          }
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "SELECT_DATA_SOURCE",
        chartId: { chartId: "1" },
        dataSource: "tweets",
        columnMetaData: []
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          acled: {
            alias: "A",
            columnMetadata: ["test"]
          },
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "tweets",
          hoverSelectedColumns: [],
          layers: {
            0: {
              dataSource: "acled"
            },
            1: {}
          }
        }
      }
    })
  })

  it("should set new chart and dashboard data source", () => {
    const state = {
      dashboard: {
        currentDataSource: "flights",
        dataSources: {
          flights: {
            alias: "B",
            columnMetaData: ["test"]
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "flights",
          hoverSelectedColumns: []
        },
        2: {
          dataSource: "flights",
          hoverSelectedColumns: []
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "SELECT_DATA_SOURCE",
        chartId: { chartId: "2" },
        dataSource: "tweets",
        columnMetaData: []
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          flights: {
            alias: "B",
            columnMetaData: ["test"]
          },
          tweets: {
            alias: "A",
            columnMetadata: []
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "flights",
          hoverSelectedColumns: []
        },
        2: {
          dataSource: "tweets",
          hoverSelectedColumns: []
        }
      }
    })
  })

  it("should remove previous data source when no charts have that data source", () => {
    const state = {
      dashboard: {
        currentDataSource: "flights",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "flights",
          hoverSelectedColumns: []
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "SELECT_DATA_SOURCE",
        chartId: { chartId: "1" },
        dataSource: "tweets",
        columnMetaData: []
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          tweets: {
            alias: "A",
            columnMetadata: []
          }
        }
      },
      filters: [],
      charts: {
        1: {
          dataSource: "tweets",
          hoverSelectedColumns: []
        }
      }
    })
  })

  it("should not remove data source if there are still filters associated with that data source", () => {
    const state = {
      dashboard: {
        currentDataSource: "flights",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          }
        }
      },
      omnifilters: [
        {
          dataSources: ["flights"]
        }
      ],
      charts: {
        1: {
          dataSource: "flights",
          hoverSelectedColumns: []
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "SELECT_DATA_SOURCE",
        chartId: { chartId: "1" },
        dataSource: "tweets",
        columnMetaData: []
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          },
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      omnifilters: [
        {
          dataSources: ["flights"]
        }
      ],
      charts: {
        1: {
          dataSource: "tweets",
          hoverSelectedColumns: []
        }
      }
    })
  })

  it("should remove data source if there are not more filters or charts associated with data source", () => {
    const state = {
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          },
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      filters: [{ dataSource: "flights" }],
      charts: {
        1: {
          dataSource: "tweets",
          hoverSelectedColumns: []
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "SELECT_DATA_SOURCE",
        chartId: { filterIndex: 0 },
        dataSource: "tweets",
        columnMetaData: []
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      filters: [{ dataSource: "flights" }],
      charts: {
        1: {
          dataSource: "tweets",
          hoverSelectedColumns: []
        }
      }
    })
  })

  it("should remove datasource if applied edit to text widget", () => {
    const state = {
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          },
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      filters: [{ dataSource: "flights" }],
      charts: {
        1: {
          type: "text",
          dataSource: "tweets"
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "APPLY_CHART_EDITS",
        chartId: "1"
      })
    ).to.deep.equal({
      dashboard: {
        currentDataSource: null,
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          }
        }
      },
      filters: [{ dataSource: "flights" }],
      charts: {
        1: {
          type: "text",
          dataSource: null
        }
      }
    })
  })

  it("should not remove datasource if applied edit to text widget but other charts have that dataSource", () => {
    const state = {
      dashboard: {
        currentDataSource: "tweets",
        dataSources: {
          flights: {
            alias: "A",
            columnMetadata: ["test"]
          },
          tweets: {
            alias: "B",
            columnMetadata: []
          }
        }
      },
      filters: [{ dataSource: "flights" }],
      charts: {
        1: {
          type: "text",
          dataSource: "tweets"
        },
        2: {
          dataSource: "tweets"
        }
      }
    }

    expect(
      reducer(identity)(state, {
        type: "APPLY_CHART_EDITS",
        chartId: "1"
      })
    ).to.deep.equal(state)
  })
})
