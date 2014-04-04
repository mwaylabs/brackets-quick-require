// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";
    var EditorManager = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        InlineRequireEditor = require('inlinerequireeditor');
    var _ = brackets.getModule("thirdparty/lodash");

    var BracketsStrings = brackets.getModule("strings");
    var Strings = require("strings");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var npmInstallDialog = require("text!html/npm-install-dialog.html");

    var isOpen = false;
    var inlineEditors = [];
    ExtensionUtils.loadStyleSheet(module, "css/quickrequire.css");

    /**
     * initialise
     */
    function initQuickRequire() {
        debugger;
        // register new inlineRequireProvider
        EditorManager.registerInlineEditProvider(inlineRequireProvider);
        _registerEvents();


    }

    /**
     * register event on 'quickrequire-npm-installed'.
     */
    function _registerEvents() {

        /**
         * builds the new code-line with correct module name and
         * updates the old line,
         * closes the opened inline editor
         *
         * @param {x.Event} event
         * @param {String[]} data contains module info
         * @param {String} installedModuleName
         */
        var _setNewModuleLine = function(event, data, installedModuleName) {
            var hostedit = EditorManager.getCurrentFullEditor(),
                oldValue = hostedit._codeMirror.doc.getValue();

            var currentLinePos = hostedit.getCursorPos().line,
                currentLineHandle = hostedit._codeMirror.getLineHandle(currentLinePos).text;

            var requireRegex = /(require\(['"])([a-zA-Z\w0-9_-\s]*)(["'\);]*)/;

            var match = requireRegex.exec(currentLineHandle);

            var replaceLine = null;
            var builtExpression = 'require("' + installedModuleName + '");';

            if (match && match[0]) {
                replaceLine = currentLineHandle.replace(match[0], builtExpression);
            } else {
                replaceLine = currentLineHandle.replace('require(', builtExpression);
            }

            hostedit._codeMirror.setLine(currentLinePos, replaceLine);

        };


        /**
         * register event 'quickrequire-npm-installed'
         */
        $(document).on('quickrequire-npm-installed', _setNewModuleLine);


    }


    /**
     * open npm-install-dialog
     *
     */
    function openNpmInstallDialog() {
        console.log('openDialog');
        var templateVars = {
            Strings: Strings,
            BracketsStrings: BracketsStrings
        };
        var template = _.template(npmInstallDialog, templateVars);
        Dialogs.showModalDialogUsingTemplate(template);
    }


    /**
     * Set up for inlineRequireProvider.
     * If there is a matching 'require(',
     * the funtion returns the current line and position,
     * where the cursor is set.
     *
     * @param {Editor} hostEditor
     * @param {object} pos current cursor position
     */
    function prepareEditorForProvider(hostEditor, pos) {
        var cursorLine,
            sel,
            match,
            checkRegex;

        sel = hostEditor.getSelection();

        // To make sure, that we have no selected text
        if (sel.start.line !== sel.end.line) {
            return null;
        }

        cursorLine = hostEditor.document.getLine(pos.line);

        // require(
        checkRegex = /(require\(["']?)/;
        match = checkRegex.exec(cursorLine);

        //
        if (match) {
            return {
                start: pos,
                cursorLine: cursorLine
            };

        } else {
            return null;
        }
    }

    /**
     * Init a new InlineRequireEditor instance,
     * returns a promise obj to observe when the
     * quickRequireEditor is ready
     *
     * @param {Editor} hostEditor
     * @param {object} pos current cursor position
     */
    function inlineRequireProvider(hostEditor, pos) {
        if(isOpen && inlineEditors.length) {
            _.each(inlineEditors, function(edit_Pos) {
                 if(edit_Pos.pos.line == pos.line) {
                     edit_Pos.quickRequireEditor.close();
                     var iToRemove = inlineEditors.indexOf(edit_Pos);
                     inlineEditors.splice(iToRemove, 1);
                     if(inlineEditors.length == 0) {
                         isOpen = false;
                     }
                     return;
                 } else {
                     appendInlineWidget(hostEditor, pos);
                 }
            });
            if(inlineEditors.length == 0) {
                isOpen = false;
            }
        }
        else {
          return  appendInlineWidget(hostEditor, pos);
        }
    }

    function appendInlineWidget(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
            result;

        if (!context) {
            return null;
        } else {
            result = new $.Deferred();
            var quickRequireEditor = new InlineRequireEditor(context);
            quickRequireEditor.load(hostEditor);

            result.resolve(quickRequireEditor);
            inlineEditors.push({
                quickRequireEditor: quickRequireEditor,
                pos: pos
            });
            isOpen = true;
            return result.promise();
        }
    }
    exports.openNpmInstallDialog = openNpmInstallDialog;
    exports.initQuickRequire = initQuickRequire;
    exports.inlineEditors = inlineEditors;

});