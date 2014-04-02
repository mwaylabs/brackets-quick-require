define(function( require, exports, module ) {
    "use strict";

    var animator = require("animator/animator");

    var EXAMPLE_MENU_ID = "mcap.animator.example",
        EXAMPLE_MENU_NAME = 'Animator example';

    function show(){
        var start = [$($('#mcap-toolbar-icon')).offset().left, $($('#mcap-toolbar-icon')).offset().top];
        var end = [$($('ins')).offset().left + $('ins').width(), $($('li :contains("index.html")')).offset().top];
        animator.animateIcon({
            start: start,
            end: end,
            deltaX: [300, 250],
            deltaY: [60, 280],
            image: require.toUrl('animator/css/document.png')
        });
    }

    function menuRegistration() {
        return {
            name: EXAMPLE_MENU_NAME,
            id: EXAMPLE_MENU_ID,
            callback: show
        };
    }

    exports.menuRegistration = menuRegistration;
});