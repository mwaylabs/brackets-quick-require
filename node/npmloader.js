(function() {
    "use strict";

    var npm = require('npm');

    /**
     * Runs the 'npm install'-command with the given path and moduleName
     * @param {options} contains path and moduleName
     */
    function npmInstallModules(options, cb) {

        npm.load({}, function() {
            npm.commands.install(options.projectPath, [options.moduleName], function(er, data) {
                if (er) {
                    cb(er);
                    return;
                }
                cb(false, data);
            });
        });

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
    }

    exports.init = init;

}());