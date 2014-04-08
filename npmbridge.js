// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var NodeConnection = brackets.getModule("utils/NodeConnection");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var ProjectManager = brackets.getModule("project/ProjectManager");
    var FileSystem = brackets.getModule('filesystem/FileSystem');


    var nodeConnection = null;






    /**
     * setup before calling the nodefunction
     *
     * @param {String} moduleName module to install
     * @param {function} cb callback
     */
    function callUpdate(config, cb) {
        if (!config || !cb || typeof cb !== 'function')
            throw new Error('invalid params');

        /**
         * gets the current project path where
         * node_module should be installed
         *
         * returns promise
         */
        var nodeFunc = function() {
            var promise = nodeConnection.domains.simple.updateManagerUpdate(config);
            promise.fail(function(err) {
                if (typeof cb === 'function') {
                    cb(err);
                }
            });
            promise.done(function(data) {
                if (typeof cb === 'function') {
                    cb(null, data);
                }
            });
            return promise;
        };


        //run the node-function
        run(nodeFunc);

    }



    function _createPackageJson(savePackage) {
        var dfd = $.Deferred();

        if(savePackage) {
            var fullPath = ProjectManager.getProjectRoot().fullPath;
            var file = FileSystem.getFileForPath(fullPath+ '/package.json');

            file.exists(function(err, exists) {

                if(err) { return dfd.reject(); }

                if(!exists) {
                    // create new package.json

                    ProjectManager.createNewItem('/', 'package.json', true, false).then(function(file) {

                        var packageJsonContent = {
                            version: "0.0.0",
                            name: ""
                        };
                        file.write(JSON.stringify(packageJsonContent), function(err, stat) {
                            dfd.resolve();
                        });

                    });

                } else {
                    dfd.resolve();
                }
            });
        } else {
            dfd.resolve();
        }
        return dfd.promise();
    }




    /**
     * setup before calling the nodefunction
     *
     * @param {String} moduleName module to install
     * @param {function} cb callback
     */
    function callNpmInstall(moduleName, savePackage, cb) {
        if (!moduleName || !cb || typeof cb !== 'function')
            throw new Error('invalid params');


        /**
         * gets the current project path where
         * node_module should be installed
         *
         * returns promise
         */
        var nodeFunc = function() {
            var projectRootPath = ProjectManager.getProjectRoot().fullPath;
            var promise = nodeConnection.domains.simple.npmInstall({
                projectPath: projectRootPath,
                moduleName: moduleName,
                save: savePackage
            });
            promise.fail(function(err) {
                if (typeof cb === 'function') {
                    cb(err);
                }
            });
            promise.done(function(data) {
                if (typeof cb === 'function') {
                    cb(null, data);
                }
            });
            return promise;
        };



        $.when(_createPackageJson(savePackage)).then( function() {
            //run the node-function
            run(nodeFunc);
        });

    }

    /**
     * Chains the "running-node" workflow,
     * Creates new NodeConnection instance
     *
     * @param {function} nodeFunc
     */
    function run(nodeFunc) {
        nodeConnection = new NodeConnection();

        /**
         * helper function to connect to node
         *
         * returns promise
         */
        function connect() {
            var promise = nodeConnection.connect(true);
            promise.fail(function(err) {
                //alert("[brackets-node] Failed to connect to node. Error:", err);
            });
            return promise;
        }

        /**
         * helper function that loads our domain into the node server
         *
         * returns promise
         */
        function loadDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/npmloader");
            var promise = nodeConnection.loadDomains([path], true);
            promise.fail(function(err) {
                //alert("[brackets-node] Failed to load domain. Error:", err);
            });
            return promise;
        }

        /**
         * helper function that chains a series of promise-returning
         * functions together via their done callbacks.
         */
        var chain = function() {
            var functions = Array.prototype.slice.call(arguments, 0);
            if (functions.length > 0) {
                var firstFunction = functions.shift();
                var firstPromise = firstFunction.call();
                firstPromise.done(function() {
                    chain.apply(null, functions);
                });
            }
        };

        // call all the helper functions in order
        chain(connect, loadDomain, nodeFunc);
    }

    exports.callNpmInstall = callNpmInstall;
    exports.callUpdate = callUpdate;

});