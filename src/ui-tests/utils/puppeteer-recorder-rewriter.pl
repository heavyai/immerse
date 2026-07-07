#!/usr/bin/perl

# use this script on the raw puppeteer recording that you got from puppeteer recorder.
# ./puppeteer-recorder-rewriter.pl puppeteer.raw.js > puppeteer.formatted.js
#
# If you have a queries file or an interrupt file, those are args 2 and 3.
#
# ./puppeteer-recorder-rewriter.pl puppeteer.raw.js queries.json interrupts.txt > puppeteer.formatted.js
#
# Once you've run this script, you'll need to keep the newly generated javascript AND the queries.json
# file if you have it. The original puppeteer recordings and the interrupts can be discarded.
#
# That file can be run on the command line:
# node puppeteer-formatted.js
#
# This is encouraged to confirm the puppeteer script is behaving properly.
#
# You may then want to hand puppeteer.formatted.js into wrap-puppeteer-test.pl to produce a jest-wrapped test.
#
# This script will:
# * add waitUntilHTMLRendered() calls before all awaitForSelector
# * add checkForModal() calls before all awaitForSelector
# * process out any pauses
# * process out any interrupts

use strict;
use warnings;

#read in our args
my ($recordFile, $mocksFile, $interruptsFile) = @ARGV;

$mocksFile ||= "";

undef $/;
# read in our puppeteer file first.
open my $recordFH, "<", $recordFile or die "Cannot open $recordFile : $!";
my $record = <$recordFH>;
close $recordFH;

my @interrupts;

# and our interrupts, if we have 'em. We don't need to read in the mocks because that whole
# file is given to puppeteer - we can't just upload a string (AFAIK)
if ($interruptsFile) {
  open my $interruptFH, "<", $interruptsFile;
  @interrupts = map{ [split /\t/] } split /\n/, <$interruptFH>;
  close $interruptFH;
}

# gets the next interrupt line. If there is one, then add in a check to match the innerHTML of the selector
# with the value. If not, then just add a log point.
sub getInterrupt {
  my $interrupt = shift @interrupts || [];

  if (@$interrupt) {
    return <<"eoPuppet"
    {
  	  await waitUntilHTMLRendered(page)
    	await checkForModal(page)
      const val = await page.\$eval('$interrupt->[0]', e => { return e.innerHTML } )
      const expected = "$interrupt->[1]"
      if (val !== expected) {
        throw new Error(
          `Could not continue, invalid count: "\${val}" !== \${expected}`
        )
      }
    }
eoPuppet
  }
  else {
    return "console.log('INTERRUPT EXPECTED HERE')\n";
  }
}

# if we have any interrupts inside of a pause block, then ensure they're included for later processing.
sub replacePause {
  my $pause = shift;
  my $numInterrupts = $pause =~ /##INTERRUPT##/g;

  return "##INTERRUPT##\n" x $numInterrupts;
}

print <<"eoPuppet";
const puppeteer = require('puppeteer');
const { waitUntilHTMLRendered, checkForModal, puppeteerRecorderHeader, logValue } = require("../../utils/recorder");



(async () => {

  const selectorLogging = true
  const updateMocks = false
  const mocksFile = "$mocksFile"
  const mocksPath = `\${__dirname}/\${mocksFile}`

  const {browser, page} = await puppeteerRecorderHeader({headless: false, puppeteer, mocksFile: updateMocks ? undefined : mocksPath, newBrowser: true})

eoPuppet

# these switch ids are useless.
$record =~ s/#Switch-\w+/[type="checkbox"]/g;

# can't click on null-dimension-toggle...it's hidden and the click on the outer toggle element handles it anyway
$record =~ s/\Qawait page.waitForSelector('[data-testid="chart-editor-right-panel"] #null-dimension-toggle')\E//g;
$record =~ s/\Qawait page.click('[data-testid="chart-editor-right-panel"] #null-dimension-toggle')\E//g;

# any clicks on the interrupt button should stick in an ##INTERRUPT## placeholder
$record =~ s/  await page.waitForSelector\('.app > .main-nav > .mock-container > .mock-container-visible > \[data-testid="puppeteer-add-interrupt-button"\]'\)\n  await page.click\('.app > .main-nav > .mock-container > .mock-container-visible > \[data-testid="puppeteer-add-interrupt-button"\]'\)/##INTERRUPT##/g;

# strip out anything between pause buttons
$record =~ s/(  await page.waitForSelector\('.app > .main-nav > .mock-container > .mock-container-visible > \[data-testid="pause-puppeteer-(\d+)"\]'\).+await page.click\('.app > .main-nav > .mock-container > .mock-container-visible > \[data-testid="pause-puppeteer-\2"\]'\))/replacePause($1)/egs;

# swap out INTERRUPT placeholders for the results of getInterrupt()
$record =~ s/##INTERRUPT##/getInterrupt()/ge;

# toss any interactions with the mock-container
$record =~ s/\s+await page.waitForSelector\('[^']+mock-container[^']+'\)//g;
$record =~ s/\s+await page.click\('[^']+mock-container[^']+'\)//g;

# we don't need a viewport
$record =~ s/.+await page.setViewport\([^)]+\)//gs;
# add on checkForModal and waitUntilHTMLRendered before all waitForSelector calls
$record =~ s/await page.waitForSelector\('([^']+)'\)/\tawait waitUntilHTMLRendered(page)\n\tawait checkForModal(page)\n\tlogValue('$1', selectorLogging)\n\tawait page.waitForSelector('$1')/g;
# make sure we do our awaits and press enter after every type interaction.
$record =~ s/page.type\('([^']+)', '([^']+)'\)/\tawait waitUntilHTMLRendered(page)\n\tawait checkForModal(page)\n\tawait page.waitForSelector('$1')\n\tawait page.\$eval('$1', function clear(e) { e.value = ""})\n\tawait page.type('$1', '$2')\n\tawait page.keyboard.press("Enter")/g;

# we can sometimes end up with double awaits. Nuke 'em.
$record =~ s/await\s*await/await/g;

print $record;
