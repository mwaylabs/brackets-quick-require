define(function( require, exports, module ) {
    "use strict";

    var animator = require("animator/animator");
    function show(){
        var $installNPMModule = $('#install-npm-module');
        var start = [$($installNPMModule).offset().left, $($installNPMModule).offset().top];

        var $nodeModulesFolder = $('li :contains("node_modules")');

        //if the node_modules folder isn't created yet, prevent animation
        if($nodeModulesFolder.length === 0) {
            return;
        }
        var end = [$($('ins')).offset().left + $('ins').width(), $($nodeModulesFolder).offset().top];
        animator.animateIcon({
            start: start,
            end: end,
            deltaX: [300, 250],
            deltaY: [60, 280],
            image: require.toUrl('animator/css/document.png')
        });
    }


    exports.show = show;
});