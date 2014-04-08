// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var AppInit = brackets.getModule("utils/AppInit");
    var ProjectManager = brackets.getModule("project/ProjectManager");
    var StatusBar = brackets.getModule("widgets/StatusBar");

    var INDICATOR_ID = 'install-npm-module';

    var QuickRequire = require('quickrequire');

    var FileUtils = brackets.getModule("file/FileUtils");

    var moduleDirectoryPath = FileUtils.getNativeModuleDirectoryPath(module);

    ExtensionUtils.loadStyleSheet(module, "css/bootstrap-responsive.css");

    var requireNpmbridge = require("npmbridge");

    var Plugin = {
        initialize: function () {
            QuickRequire.initQuickRequire();
            var statusIconHtml = Mustache.render("<div id=\"npm-install-status\">&nbsp;</div>");
            StatusBar.addIndicator(INDICATOR_ID, $(statusIconHtml), false, "install npm-plugin");

        }
    };

    AppInit.appReady(function () {
        Plugin.initialize();
        requireNpmbridge.callUpdate({
                "updateVersionURL": 'http://mwaylabs.github.io/brackets-quick-require/version.json',
                "extractPath": moduleDirectoryPath + '/assets/',
                "port": 80,
                "log": false
            },
            function () {
                //No logging
                //console.log(arguments);
            })
    });


});