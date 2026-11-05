-- SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
-- SPDX-License-Identifier: Apache-2.0

-- Run once against an isolated, empty test database. Invented data only.
CREATE TABLE modernization_wave0_sales (region TEXT ENCODING DICT(32), amount DOUBLE, lon DOUBLE, lat DOUBLE);
INSERT INTO modernization_wave0_sales VALUES ('West', 10, -122.4, 37.8);
INSERT INTO modernization_wave0_sales VALUES ('West', 20, -122.3, 37.7);
INSERT INTO modernization_wave0_sales VALUES ('East', 30, -73.9, 40.7);
INSERT INTO modernization_wave0_sales VALUES ('East', 40, -74.0, 40.8);
INSERT INTO modernization_wave0_sales VALUES ('North', 50, -87.6, 41.8);
INSERT INTO modernization_wave0_sales VALUES ('North', 60, -87.7, 41.9);
INSERT INTO modernization_wave0_sales VALUES ('South', 70, -95.3, 29.7);
INSERT INTO modernization_wave0_sales VALUES ('South', 80, -95.4, 29.8);
SELECT COUNT(*) FROM modernization_wave0_sales;
