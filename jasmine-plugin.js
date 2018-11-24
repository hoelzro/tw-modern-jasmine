/*\
title: $:/plugins/hoelzro/jasmine3/jasmine-plugin.js
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
	var jasmine = $tw.modules.execute("$:/plugins/hoelzro/jasmine3/jasmine.js");
	jasmine = jasmine.core(jasmine);
	// Prepare the Jasmine environment
	var initialContext = {
		console: console,
		exports: {},
		$tw: $tw
	};

	if($tw.browser) {
		$tw.utils.extend(initialContext, {
			setInterval: setInterval.bind(window),
			clearInterval: clearInterval.bind(window),
			setTimeout: setTimeout.bind(window),
			clearTimeout: clearTimeout.bind(window)
		});
	} else {
		$tw.utils.extend(initialContext, {
			setInterval: setInterval,
			clearInterval: clearInterval,
			setTimeout: setTimeout,
			clearTimeout: clearTimeout
		});
	}
	var jasmineEnv = jasmine.getEnv({
		global: initialContext
	});
	jasmineEnv.randomizeTests(false);
	// Add our other context variables
	var context = $tw.utils.extend({},jasmineEnv,initialContext);
	jasmineEnv.updateInterval = 1000;
	// Execute the appropriate reporter
	var reporterTitle = $tw.browser ? "$:/plugins/hoelzro/jasmine3/jasmine-html.js" : "$:/plugins/hoelzro/jasmine3/reporter.js";
	context.require = function(moduleTitle) {
		return $tw.modules.execute(moduleTitle,reporterTitle);
	};
	context.jasmineRequire = {};
	var code = $tw.wiki.getTiddlerText(reporterTitle,""),
		reporterExports = $tw.utils.evalSandboxed(code,context,reporterTitle);
	// Link the reporter into jasmine
	if($tw.browser) {
		context.jasmineRequire.html(jasmine);
		var htmlReporter = new jasmine.HtmlReporter({
			getContainer: function() { return document.body; },
			createElement: document.createElement.bind(document),
			createTextNode: document.createTextNode.bind(document),
		});
		jasmineEnv.addReporter(htmlReporter);
		htmlReporter.initialize();
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
