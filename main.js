define(function(require, exports, module) {
    "use strict";

    //var CommandManager = brackets.getModule("command/CommandManager");
    //var EditorManager = brackets.getModule("editor/EditorManager");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var AppInit = brackets.getModule("utils/AppInit");


    var QuickRequire = require('quickrequire');


    //ExtensionUtils.loadStyleSheet(module, "css/mcap.css");
    ExtensionUtils.loadStyleSheet(module, "css/bootstrap-responsive.css");

    // Backbone.ajax = function() {
    //     arguments[0].cache = false;
    //     return Backbone.$.ajax.apply(Backbone.$, arguments);
    // };


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