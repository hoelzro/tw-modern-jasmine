(function() {
  var colorizer = {
    pass: function(s) {
      return '\033[32m' + s + '\033[0m';
    },

    fail: function(s) {
      return '\033[31m' + s + '\033[0m';
    }
  };

  exports.TerminalVerboseReporter = function() {};

  exports.TerminalVerboseReporter.prototype.jasmineStarted = function(suiteInfo) {
    this.startTime = new Date();
    this.depth = 0;
    this.testCount = 0;
    this.assertionCount = 0;
    this.failures = [];
  };

  exports.TerminalVerboseReporter.prototype.jasmineDone = function(suiteInfo) {
    var endTime = new Date();

    var failureCount = this.failures.length;
    var hasAnyFailures = failureCount > 0;

    if(hasAnyFailures) {
      console.log("\nFailures:");
      this._printFailures();
    }

    console.log(`\n\nFinished in ${(endTime.getTime() - this.startTime.getTime()) / 1000} seconds`);

    var testsInflected      = this.testCount == 1      ? 'test'      : 'tests';
    var assertionsInflected = this.assertionCount == 1 ? 'assertion' : 'assertions';
    var failuresInflected   = failureCount == 1        ? 'failure'   : 'failures';

    console.log((hasAnyFailures ? colorizer.fail : colorizer.pass)(`${this.testCount} ${testsInflected}, ${this.assertionCount} ${assertionsInflected}, ${failureCount} ${failuresInflected}`));
  };

  exports.TerminalVerboseReporter.prototype.suiteStarted = function(result) {
    console.log('    '.repeat(this.depth) + result.description);
    this.depth++;
  };

  exports.TerminalVerboseReporter.prototype.suiteDone = function(result) {
    this.depth--;
  };

  exports.TerminalVerboseReporter.prototype.specDone = function(result) {
    if(result.status != 'passed' && result.status != 'failed') {
      return;
    }

    var didPass = result.status == 'passed';

    this.testCount++;
    if(!didPass) {
      this.failures.push(result);
    }

    this.assertionCount += result.passedExpectations.length;
    this.assertionCount += result.failedExpectations.length;

    console.log('    '.repeat(this.depth) + (didPass ? colorizer.pass : colorizer.fail)(result.description));
  };

  exports.TerminalVerboseReporter.prototype._printFailures = function() {
    var i = 1;

    for(let failure of this.failures) {
      for(let failedExpectation of failure.failedExpectations) {
        console.log('');
        console.log(`  ${i}) ${failure.fullName}`);
        console.log('   Message:');
        console.log(colorizer.fail(`     ${failedExpectation.message}`));
        console.log('   Stacktrace:');
        console.log(`     ${failedExpectation.stack}`);

        i++;
      }
    }
  };
})();
