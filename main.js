// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var AppInit = brackets.getModule("utils/AppInit");
    var ProjectManager = brackets.getModule("project/ProjectManager");

    var QuickRequire = require('quickrequire');

    var FileUtils = brackets.getModule("file/FileUtils");

    var moduleDirectoryPath = FileUtils.getNativeModuleDirectoryPath(module);

    ExtensionUtils.loadStyleSheet(module, "css/bootstrap-responsive.css");
    ExtensionUtils.loadStyleSheet(module, "node_modules/font-awesome/css/font-awesome.css");
    var requireNpmbridge = require("npmbridge");

    var Plugin = {
        initialize: function () {
            QuickRequire.initQuickRequire();

        }
    };

    AppInit.appReady(function () {
        Plugin.initialize();
        requireNpmbridge.callUpdate({
                "updateVersionURL": 'https://raw.githubusercontent.com/mwaylabs/brackets-quick-require/master/update-source/version.json',
                "extractPath": moduleDirectoryPath + '/assets'
            },
            function () {
                console.log(arguments);
            })
    });


});