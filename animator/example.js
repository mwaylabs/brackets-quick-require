define(function( require, exports, module ) {
    "use strict";

    var animator = require("animator/animator");
    function show(){
        var $installNPMModule = $('#install-npm-module');
        var start = [$($installNPMModule).offset().left, $($installNPMModule).offset().top];
        var end = [$($('ins')).offset().left + $('ins').width(), $($('li :contains("node_modules")')).offset().top];
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