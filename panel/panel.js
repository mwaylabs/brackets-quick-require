/**
 * Relution.io Brackets Plugin
 *
 * @copyright 2014, M-Way Solutions GmbH
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function( require, exports ) {
    "use strict"

    var PanelManager = brackets.getModule("view/PanelManager");

    var AppInit = brackets.getModule("utils/AppInit");
    var LanguageManager = brackets.getModule("language/LanguageManager");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var DocumentManager = brackets.getModule("document/DocumentManager");

    var PanelMarkup = require("text!panel/html/panel.html");


    // Strings
    var BracketsStrings = brackets.getModule("strings");
    var Strings = require("../strings");

    // the current editor
    var _currentEditor = null;
    // the current document (contains the json text)
    var _currentDocument = null;

    // the backbone view
    var editorView = null;

    var projectPath = null;

    // render the panel
    var $panel = $(Mustache.render(PanelMarkup, Strings));
    // create the panel
    var bottomPanel = PanelManager.createBottomPanel("npmpanel", $panel);



    // bind events //

    // bind the close button of the panel
    $panel.on("click", ".close", function() {
        _hide();
    });



    /**
     * Returns the active editor
     * @returns {*}
     * @private
     */
    function _getActiveEditor() {
        return EditorManager.getActiveEditor();
    }

    /**
     * Open the panel
     * @param fileName
     * @param editor
     * @private
     */
    function _openPanel( fileName, editor ) {
        // set the current editor
        _currentEditor = editor || _getActiveEditor();
        // set the current document
        _currentDocument = _currentEditor.document;
        // clear previous change event bindings
        $(_currentDocument).off('change', documentChange);
        // set change event
        $(_currentDocument).on('change', documentChange);
        // show the panel
        show();
    }


    /**
     * Show the panel
     * @param text
     * @returns {*}
     */
    function show( text ) {

        // show the panel
        bottomPanel.show();
        // return this for chaining
        return this;
    }

    /**
     * Internal hide
     * @returns {*}
     * @private
     */
    function _hide() {
        hide();
        // return this for chaining
        return this;
    }

    /**
     * Hide the panel
     * @returns {*}
     */
    function hide() {
        // hide the panel
        bottomPanel.hide();
        // return this for chaining
        return this;
    }

    /**
     * Toggle the panel
     * @param settings
     * @returns {*}
     */
    function toggle( settings ) {
        if( bottomPanel.isVisible() ) {
            hide();
            if( settings && typeof settings.on === 'function' ) {
                settings.on();
            }
        } else {
            show();
            if( settings && typeof settings.off === 'function' ) {
                settings.off();
            }

        }
        // return this for chaining
        return this;
    }

    AppInit.appReady(function() {
        // set the current editor
        _currentEditor = _getActiveEditor();

    });

    // when a file changes determine if the panel should be visible or not
    $(EditorManager).on('activeEditorChange', function( event, editor ) {
        // if no editor is passed - then we can be sure it is not an app.rln
        if( editor ) {

        } else {
            // no app.rln so hide the panel
            hide();
        }
    });


    // API
    exports.show = show;
    exports.hide = hide;
    exports.toggle = toggle;

});