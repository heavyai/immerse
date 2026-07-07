# Puppeteer Recording cheatsheet

This is to help you configure and use puppeteer recorder to automate most-ish of your test writing, if you'd like.

For starters, install it into Chrome @ https://chrome.google.com/webstore/detail/puppeteer-recorder/djeegiggegleadkkbgopoonhjimgehda?hl=en

Secondly, if you want to use the mock connectors, then in Immerse go to the control-panel and turn on `dev/enable_mock_connector`

## What to do

Start up immerse and navigate to the new dashboard page (or wherever). Click on puppeteer recorder and start recording. Create your test as normal.

## Pausing puppeteer recorder

If you have the mock connector enabled, you can press the pause button in the upper left to stop recording actions. These can be filtered out later by
puppeteer-recorder-rewriter.pl.

Press the play button to resume.

## Adding an interrupt

If you have the mock connector enabled, you can press the bug button to add an interrupt. If you've filled in a selector and a value, then pressing the interrupt
button will add an interrupt and note that you want to look for that value. This can be inserted via puppeteer-recorder-rewriter.pl

## downloading the files

When you're done, end recording in puppeteer recorder and click "Copy to clipboard". By convention, place this file in ui-tests/recorded/NAMEOFYOURTEST/puppeteer.raw.js

Then, click the two download buttons on the mock connector menu to download the queries.json file and interrupts.txt file. Copy those into the same directory.

## rewriting your files.

Run the recorder rewriter.

immerse/src/ui-tests/utils/puppeteer-recorder-rewriter.pl puppeteer.raw.js queries.json interrupts.txt > puppeteer.reformatted.js

You can now test this script and confirm it works:

node puppeteer.reformatted.js

Correct any undesirable behavior and/or puppeteer bugs.

## creating a test.

Run the test wrapper on your reformmatted value.

immerse/src/ui-tests/utils/wrap-puppeteer-test.pl "This is my test description" "This is my test name" puppeteer.reformatted.js > NAMEOFMYTEST.ui.test.js

This test can now be run through npm run test:ui. I recommend testing it to confirm it works (you can do that with "DEBUG" in the name to run only your test)

## add files to git.

Add to git:
src/ui-tests/recorded/NAMEOFYOURTEST/queries.json (if you have one)
src/ui-tests/recorded/NAMEOFYOURTEST/NAMEOFMYTEST.ui.test.js

Commit and push. You're done!
