// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {

    var EditorManager = brackets.getModule("editor/EditorManager");

    var moduleVersionFile = require("text!assets/test/version.json");
    var pathToModuleFiles = 'assets/test/';

    function getModuleList() {
        _getFiles();
    }

    function _getParsedVersionFile() {
        return JSON.parse(moduleVersionFile);
    }

    function _getFileCount() {
        return _getParsedVersionFile().fileCount;
    }

    // function _requireFileList() {
    // 	_.each(_getFileCount()
    // }

    function _getFiles() {
        var filesArray = [];
        debugger;
        for (var i = _getFileCount(); i > 0; i--) {
            var path = pathToModuleFiles + 'npm' + i + '.json';
            appshell.fs.readFile(path, 'json', function() {
                //TODO
                //Findout the encoding
                debugger;
                //appshell.fs.readFile('assets/test/npm1.json', 'JSON', function() {console.log(arguments)})
                //filesArray.push()
            });
            //filesArray.push(require(pathToModuleFiles + 'npm' + i + '.json'));
            //filesArray.push(pathToModuleFiles + 'npm' + i + '.json');
            console.log(filesArray);
        }

    }


    exports.getModuleList = getModuleList;
});