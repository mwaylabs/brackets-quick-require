// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var AppInit = brackets.getModule("utils/AppInit");

    var QuickRequire = require('quickrequire');

    ExtensionUtils.loadStyleSheet(module, "css/bootstrap-responsive.css");
    ExtensionUtils.loadStyleSheet(module, "node_modules/font-awesome/css/font-awesome.css");

    var Plugin = {
        initialize: function() {
            QuickRequire.initQuickRequire();
        }
    };

    AppInit.appReady(function() {
        Plugin.initialize();
        brackets.app.showDeveloperTools();
    });


});