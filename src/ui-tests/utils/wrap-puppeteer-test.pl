#!/usr/bin/perl

# SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# use this script on the processed puppeteer script that you got from puppeteer-recorder-rewriter.pl
#
# it needs 3 args - the name of the describe block, the name of the test, and the file name.
# ./wrap-puppeteer-test.pl "This is a recorded pie chart test" "Click on all the options for a pie chart" puppeteer.pie.js > pie.ui.test.js
#
# it will re-format a directly invoked puppeteer test into one that works in npm run test:ui

use strict;
use warnings;

my ($description, $test, $puppeteerFile) = @ARGV;

undef $/;
open my $puppeteerFH, "<", $puppeteerFile or die "Cannot open $puppeteerFile : $!";
my $puppeteer = <$puppeteerFH>;
close $puppeteerFH;

my $header = join "\n", $puppeteer =~ m!(.+require\("../../utils/recorder"\))!gs;

$puppeteer =~ s/\(async \(\) => {(.+)}\)\(\)/$1/s;

$puppeteer =~ s/\Q$header\E//g;
$puppeteer =~ s/\QpuppeteerRecorderHeader({headless: false,\E/puppeteerRecorderHeader({headless : true,/g;
$puppeteer =~ s!mocksFile\s*:\s*"(.+)"!mocksFile: `\${__dirname}/$1`!g;
$puppeteer =~ s/newBrowser: true/newBrowser: false/g;
$puppeteer =~ s/\Qawait browser.close()\E//g;
$puppeteer =~ s/const selectorLogging = true/const selectorLogging = false/g;

# pull out the _first_ awaitUntilHTMLRendered and set the outerPage in front of it.
$puppeteer =~ s/\Qawait waitUntilHTMLRendered(page)\E/outerPage = page\nawait waitUntilHTMLRendered(page)/;



print <<"eoTest";

$header

describe("$description", () => {
  it("$test", async () => {
    let hasNoExceptions = true
    let outerPage = null
    try {
      jest.setTimeout(60000);
      $puppeteer
      if (updateMocks) {
        await waitUntilHTMLRendered(page)
        await page.\$eval(
          '[data-testid="query-mocks-file"]',
          // eslint-disable-next-line
          (e, mocksFile) => (e.value = mocksFile),
          mocksFile
        )
        await page.waitForSelector(
          '.app > .main-nav > .mock-container > .mock-container-invisible > [data-testid="download-query-mocks"]'
        )
        await page.click(
          '.app > .main-nav > .mock-container > .mock-container-invisible > [data-testid="download-query-mocks"]'
        )
      }
    }
    catch (e) {
      hasNoExceptions = e
    }
    finally {
      if (outerPage) {
        await outerPage.close()
      }
    }

    expect(hasNoExceptions).toEqual(true)
  })
})
eoTest
