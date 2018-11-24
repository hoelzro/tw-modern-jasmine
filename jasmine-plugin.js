/*\
title: $:/plugins/hoelzro/modern-jasmine/jasmine-plugin.js
type: application/javascript
module-type: startup

The main module of the Jasmine test plugin for TiddlyWiki5

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var TEST_TIDDLER_FILTER = "[type[application/javascript]tag[$:/tags/test-spec]]";

/*
Startup function for running tests
*/
exports.startup = function() {
	// Get the Jasmine exports
	var jasmine = $tw.modules.execute("$:/plugins/hoelzro/modern-jasmine/jasmine.js");
	jasmine = jasmine.core(jasmine);
	// Prepare the Jasmine environment
	var initialContext = {
		console: console,
		setInterval: setInterval,
		clearInterval: clearInterval,
		setTimeout: setTimeout,
		clearTimeout: clearTimeout,
		exports: {},
		$tw: $tw
	};
	var jasmineEnv = jasmine.getEnv({
		global: initialContext
	});
	// Add our other context variables
	var context = $tw.utils.extend({},jasmineEnv,initialContext);
	jasmineEnv.updateInterval = 1000;
	// Execute the appropriate reporter
	var reporterTitle = $tw.browser ? "$:/plugins/hoelzro/modern-jasmine/jasmine-html.js" : "$:/plugins/hoelzro/modern-jasmine/reporter.js";
	context.require = function(moduleTitle) {
		return $tw.modules.execute(moduleTitle,reporterTitle);
	};
	context.jasmineRequire = {};
	var code = $tw.wiki.getTiddlerText(reporterTitle,""),
		reporterExports = $tw.utils.evalSandboxed(code,context,reporterTitle);
	// Link the reporter into jasmine
	if($tw.browser) {
		jasmineEnv.addReporter(new context.jasmineRequire.HtmlReporter());
	} else {
		jasmineEnv.addReporter(new reporterExports.TerminalVerboseReporter());
	}
	// Iterate through all the test modules
	var tests = $tw.wiki.filterTiddlers(TEST_TIDDLER_FILTER);
	$tw.utils.each(tests,function(title,index) {
		// Get the test specification code
		var code = $tw.wiki.getTiddlerText(title,"");
		// Add a require handler
		context.require = function(moduleTitle) {
			return $tw.modules.execute(moduleTitle,title);
		};
		// Execute the test code with the context variables
		$tw.utils.evalSandboxed(code,context,title);
	});
	// Execute the tests
	jasmineEnv.execute();
};

})();
