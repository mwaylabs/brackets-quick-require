define(function (require, exports, module) {
    //"use strict";

    ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    ExtensionUtils.loadStyleSheet(module, "css/animator.css");

    var curveAnimator = require("animator/lib/curveanimator");

    /**
     * Displays the animation of the icon from start to endpoint
     * @param options Options for the path of the animation
     * @example
     * var start = [$($('#mcap-toolbar-icon')).offset().left, $($('#mcap-toolbar-icon')).offset().top];
     * var end = [$($('ins')).offset().left + $('ins').width(), $($('li :contains("index.html")')).offset().top];
     * animator.animateIcon({
     *        start: start,
     *        end: end,
     *        deltaX: [300, 250],
     *        deltaY: [60, 280],
     *        image: require.toUrl('animator/css/document.png')
     *    });
     */

    animateIcon = function( options ){
        var deltaX = options.deltaX;
        var deltaY = options.deltaY;
        var start = options.start;
        var end = options.end;
        var image = options.image;

        var iconWrapper = $("<div>", {id: "icon-wrapper"});
        var animIcon = new Image();
        animIcon.setAttribute('id','anim-icon');
        animIcon.setAttribute('src',image);
        iconWrapper.append(animIcon);
        $(iconWrapper).appendTo('body');

        var curve = new CurveAnimator(
            start, end, deltaX, deltaY
        );

        var o = document.getElementById('icon-wrapper');
        o.style.position = 'absolute';

        var item = $(animIcon);
        var property = getComputedStyle(item[0]).getPropertyValue('transition');
        property = parseFloat(property.split(' ')[1]);

        item.addClass('enlarge');

        setTimeout(function(){
            item.removeClass('enlarge');
        },property*1000);

        curve.animate(property*2, function(point,angle){
            o.style.left = point.x+"px";
            o.style.top  = point.y+"px";
        });
        setTimeout(function(){
            $(o).remove();
        }, property*2000)
    };

    exports.animateIcon = animateIcon;

});