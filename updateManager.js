
define(function( require, exports, module ) {
    "use strict";

    var FileUtils = brackets.getModule("file/FileUtils");

    var moduleDirectoryPath = FileUtils.getNativeModuleDirectoryPath(module);
    var requireNpmbridge = require("brackets-quick-require/npmbridge");

    function updateQuickrequireList() {
        debugger;
        requireNpmbridge.callUpdate({
                "updateVersionURL": 'http://mwaylabs.github.io/brackets-quick-require/version.json',
                "extractPath": moduleDirectoryPath + '/assets/',
                "port": 80,
                "log": true
            },
            function () {
                //No logging
                console.log(arguments);
            })
    }

    exports.updateQuickrequireList = updateQuickrequireList;


});


