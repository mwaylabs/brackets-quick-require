// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

(function() {
    "use strict";
    var npm = require('npm');
    var updateManager = require('../node_modules/update-manager/update-manager');

    /**
     * Runs the 'npm install'-command with the given path and moduleName
     * @param {options} contains path and moduleName
     */
    function npmInstallModules(options, cb) {

       var config = {};
        if (options.save) {
            config.save = true;
        }
        npm.load(config, function() {
            npm.commands.install(options.projectPath, [options.moduleName+'@'+options.version], function(er, data) {
                if (er) {
                    cb(er);
                    return;
                }
                cb(false, data);
            });
        });
    }

    function updateManagerUpdate(options, cb){

        options.error = function(e){
            cb(e);
        };

        options.success = function(data){
            cb(false, data);
        };

        updateManager.update(options);
    }

    /**
     * Initializes the test domain with several test commands.
     * @param {DomainManager} DomainManager The DomainManager for the server
     */
    function init(DomainManager) {
        if (!DomainManager.hasDomain("simple")) {
            DomainManager.registerDomain("simple", {
                major: 0,
                minor: 1
            });
        }
        DomainManager.registerCommand(
            "simple",
            "npmInstall",
            npmInstallModules,
            true,
            "", [], []
        );
        DomainManager.registerCommand(
            "simple",
            "updateManagerUpdate",
            updateManagerUpdate,
            true,
            "", [], []
        );

    }

    exports.init = init;

}());