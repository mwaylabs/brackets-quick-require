// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var NodeConnection = brackets.getModule("utils/NodeConnection");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var FileUtils = brackets.getModule("file/FileUtils");

    var moduleDirectoryPath = FileUtils.getNativeModuleDirectoryPath(module);

    var nodeConnection = null;

    /**
     *
     * @param updateVersionURL {URL}, URL to the version.json
     */
    function callUpdate(updateVersionURL) {
        var globalExtensionDir = null;

        if (!updateVersionURL)
            throw new Error('invalid params');

        //get path of extension folder
        //get rid of the last folder, 
        globalExtensionDir = moduleDirectoryPath.replace(/\/[^\/]+$/, '');

        var nodeFunc = function() {

            var promise = nodeConnection.domains.simple.nodeUpdate({
                updateVersionURL: updateVersionURL,
                globalExtensionDir: globalExtensionDir
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

        //run the node-function
        run(nodeFunc);

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
            var path = ExtensionUtils.getModulePath(module, "node_modules/update-manager/update-manager");
            var promise = nodeConnection.loadDomains([path], true);
            promise.fail(function(err) {
                console.log("[brackets-node] Failed to load domain. Error:", err);
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

    exports.callUpdate = callUpdate;

});