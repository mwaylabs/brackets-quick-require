// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
//    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager");

    var DocumentManager = brackets.getModule('document/DocumentManager');

    // Asset Backbone Model
    var Asset = require('models/asset');

    // an mcap project also called application
    var sidebar = require('sidebar/sidebar');

    var mCap = require('src/mCap');

    var project = require('project/project');

    var file = require('src/file');

    var Strings = require("strings");

    var quickrequire = null;
    var currentProject = null;

    /**
     * @type {{name: string, version: string, description: string, main: string, author: string, dependencies: {}}}
     */
    var packageJsonContent = {
        "name": "{{PROJECT_NAME}}",
        "version": "0.0.1",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "app.js",
        "author": "{{USER_NAME}}",
        "dependencies": {

        }
    };

    function _getCurrentProject() {
        if(currentProject) {
            return currentProject;
        }

        return project.getCurrentProject();
    }


    /**
     * Returns the package.json in the root of the server directory
     * @returns {*}
     * @private
     */
    function _getPackageJson() {
        packageJson = null;
        var currentProjectRootAsset = sidebar.getCurrentProjectRootAsset();

        currentProjectRootAsset.subtree.each(function (asset) {
            if (asset.get('pathName').split('/').pop() === 'package.json') {
                packageJson = asset;
            }
        });

        if(!packageJson) {

            // TODO: create new package.json
            // Not package.json available, create one
            packageJson = new Asset.File({
                pathName: currentProjectRootAsset.attributes.pathName + '/' + 'package.json'
            });

            // add the new package.json to the subtree of the root (inside the server directory)
            currentProjectRootAsset.subtree.add(packageJson)

            currentProjectRootAsset.save();

            /*currentProjectRootAsset.subtree.add(packageJson);
            packageJson.save();*/
        }

        return packageJson;

    }

    /**
     * Returns the parsed content of the package.json
     * @param packageJson {Asset.File}
     * @returns {*}
     * @private
     */
    function _parsePackageJsonContent(packageJson) {
        var parsedContent = null;

        var content = packageJson.get('content');
        if(content) {
            try {
                parsedContent = JSON.parse(content);
            } catch(e) {

                console.log('Unable to parse package.json ', e);
            }
        } else {
            var currentProject = _getCurrentProject();
            packageJsonContent.name = currentProject.attributes.name || "";
            packageJsonContent.description = currentProject.attributes.description || "";

            //TODO set Author
            packageJsonContent.author = "";
            parsedContent = packageJsonContent;
        }

        return parsedContent;
    }

    /**
     * Extends the old package.json object by the new dependency
     * returns the new content (as a obj).
     * @param dependency {String} name of the node-module
     * @param oldContent {Object} parsed content of the package json
     * @returns {*|{name: string, version: string, description: string, main: string, author: string, dependencies: {}}}
     * @private
     */
    function _extendPackageJsonContent(dependency, oldContent) {
        var content = oldContent;
        //extend dependencies with dependency
        content.dependencies[dependency] = '*';
        return content;
    }

    /**
     * Saves a dependency in the package.json by a given data object.
     * @param data {{module: string, timestamp: Integer}}
     * @returns {Deferred}
     */
    function saveDependency(data) {
        var dfd = new $.Deferred();

        var packageJson = null;
        var oldContent = null;
        var newContent = null;

        // get package json
        packageJson = _getPackageJson();

        oldContent = _parsePackageJsonContent(packageJson);
        if(oldContent === null) {
            return dfd.reject({msg: 'Invalid package.json'}).promise();
        }
        // modify package json
        newContent = _extendPackageJsonContent(data.module, oldContent);
        newContent = JSON.stringify(newContent, null, 2);
        // save package json
        if(newContent !== "null"){
            packageJson.set('content', newContent);
            packageJson.save().done(function() {
                dfd.resolve();
            }).fail(function() {
                dfd.reject();
            });
        } else {
            dfd.reject();
        }


        return dfd.promise();
    }


    /**
     *
     * @param data {save: boolean, timestamp: number, module: String}
     * @param Quickrequire {}
     */
    function saveInPackageJson(data, Quickrequire) {
        var currDoc = DocumentManager.getCurrentDocument();

        if( !file.isPseudoPath(currDoc.file._path)) {
            data.defaultCallback(data);
            return;
        }

        quickrequire = Quickrequire;
        quickrequire.openNpmInstallDialog(data.timestamp);
        saveDependency(data).then(function() {

            $(document).trigger('quickrequire-npm-installed', [data, data.module]);
            quickrequire.removeAndCloseByTimestamp(data.timestamp);
            sidebar.renderUpdate();
            // run npm install
            CommandManager.execute('mcap-npm-install')

        }).fail(function(err) {
            console.log('failed');
            var $modalHtml = $('.npm-install-dialog .modal-body');
            var errorContentDialog = '<div class="status error"><p>' + Strings.NOTIFICATON_ERROR_TITLE + ': ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + ' ' + Strings.NOTIFICATION_ERROR_DURING_NPMINSTALL + '</p><p>' + err.msg + '</p> </div>'
            $modalHtml.html(errorContentDialog);
            $modalHtml.parent().find('.primary').remove();

            //quickrequire.removeAndCloseByTimestamp(data.timestamp);
        });


    }


    function preRender() {
        var currDoc = DocumentManager.getCurrentDocument();
        return file.isPseudoPath(currDoc.file._path);
    }

    exports.preRender = preRender;
    exports.saveInPackageJson = saveInPackageJson;


});