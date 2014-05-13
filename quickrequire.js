// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";
    var EditorManager = brackets.getModule("editor/EditorManager");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var _ = brackets.getModule("thirdparty/lodash");
    var BracketsStrings = brackets.getModule("strings");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var StatusBar = brackets.getModule("widgets/StatusBar");
    var Panel = require("panel/panel");

    var InlineRequireEditor = require('inlinerequireeditor');

    var npmInstallDialog = require("text!html/npm-install-dialog.html");
    var Strings = require("strings");


    var inlineEditors = [];
    ExtensionUtils.loadStyleSheet(module, "css/quickrequire.css");

    //var quickrequire = require("quickrequire");

    var INDICATOR_ID = 'install-npm-module';
    var INDICATOR_ID2 = 'installing-busy';

    var apiOptions = null;

    var socketIoClient = require("socketClient");
    var socketConnection = null;
    var scrollheight = null;

    // this is where the log table lives
    var $npmLoggerContainer = null;

    /**
     * initialise
     */
    function initQuickRequire(options) {
        apiOptions = options;
        var statusIconHtml = Mustache.render("<div id=\"npm-install-status\">&nbsp;</div>");
        StatusBar.addIndicator(INDICATOR_ID, $(statusIconHtml), false, "install npm-plugin");

        // register new inlineRequireProvider
        EditorManager.registerInlineEditProvider(inlineRequireProvider);
        _registerEvents();
    }

    /**
     * register event on 'quickrequire-npm-installed'.
     */
    function _registerEvents() {
        /**
         * register event 'quickrequire-npm-installed'
         */
        $(document).on('quickrequire-npm-installed', _setNewModuleLine);
    }


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
        var hostedit = EditorManager.getCurrentFullEditor();


        var currentLinePos = hostedit.getCursorPos().line,
            currentLineHandle = hostedit._codeMirror.getLineHandle(currentLinePos).text;
        var oldLineValue = hostedit._codeMirror.doc.getLine(currentLinePos);

        var requireRegex = /(require\(['"])([a-zA-Z\w0-9_-\s]*)(["'\);]*)/;

        var match = requireRegex.exec(currentLineHandle);

        var replaceLine = null;
        var builtExpression = 'require("' + installedModuleName + '");';
        var builtExpressionSingle = "require('" + installedModuleName + "');";
        var regex = new RegExp('"');

        if (match && match[0]) {
            if(regex.test(currentLineHandle)) {
                replaceLine = currentLineHandle.replace(match[0], builtExpression);
            } else {
                replaceLine = currentLineHandle.replace(match[0], builtExpressionSingle);
            }
        } else {
            replaceLine = currentLineHandle.replace('require(', builtExpression);
        }

        hostedit._codeMirror.replaceRange(replaceLine, {line:currentLinePos, ch: 0}, {line:currentLinePos, ch: replaceLine.length+1})
    };


    /**
     * open npm-install-dialog
     *
     */
    function openNpmInstallDialog(timestampData) {
        Panel.show();
        Panel._registerEvent();
        var templateVars = {
            Strings: Strings,
            BracketsStrings: BracketsStrings
        };
        var template = _.template(npmInstallDialog, templateVars);
        Dialogs.showModalDialogUsingTemplate(template);
        showProcessInStatusbar();

        //Run in background
        $(document).find('.dialog-button').on('click', function() {
            StatusBar.hideBusyIndicator(INDICATOR_ID2);
            var $busyIndicator = $("#status-bar .spinner");
            $busyIndicator.addClass("spin");
            removeAndCloseByTimestamp(timestampData);
        });
    }

    function showProcessInStatusbar() {

        StatusBar.updateIndicator(INDICATOR_ID, true, "install npm-plugin", "install npm-plugin", "spinner");
        StatusBar.showBusyIndicator(INDICATOR_ID2);
    }

    function openSocketIoConnection() {


        // we gonna connect only once
        if(!socketConnection) {
            socketConnection = socketIoClient.connect('http://localhost:1234', {reconnect: false});
        }

        //Listen on connect. if fired, listen to some npmLogging
        socketConnection.on('connect', function() {

            socketConnection.on('npmHttpLogging', function(message) {
                appendLogLine(message);
            });
            socketConnection.on('npmErrorLogging', function(message) {
                appendLogLine(message);
            });
            socketConnection.on('npmWarnLogging', function(message) {
                appendLogLine(message);
            });

        });
    }
    var i = 0;
    function appendLogLine(message, warn) {
        console.log(++i);
        if(!$npmLoggerContainer) {
            $npmLoggerContainer = $('.npm-logger-container');
        }
        if(!scrollheight) {
            scrollheight = $npmLoggerContainer.find('.bottom-panel-table').height();
        }
        //Increase by 27px (its the height of one entry).
        //we do it this way to save a bunch of dom-access
        scrollheight += 27;

        // append new log-line
        $($npmLoggerContainer).find('tbody').append(getLogLine(message));

        // scroll always to the bottom in the panel
        $($npmLoggerContainer).scrollTop(scrollheight);
    }

    function completeLogger(data) {
        debugger;
        var $npmLogger = $('#npm-logger');
        $npmLogger.append('<div class="finish">' + data + '</div>')
    }


    /**
     * Builds a table-log-line with the given message-obj
     *
     * @param message {object} emitted from the server. contains one log-entry
     * @returns {string}
     */
    function getLogLine(message) {
        return '<tr class="' + message.level + '"><td>' + message.level + '</td><td class="line-number">' + message.prefix + '</td><td>' + message.message + '</td></tr>';
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
        var addNew = true;
        if(inlineEditors.length) {
            addNew = removeAndCloseByPos(pos);
            if(addNew) {
                return appendInlineWidget(hostEditor, pos);
            }
        }
        else {
            return appendInlineWidget(hostEditor, pos);
        }
    }

    /**
     * Closes and removes an editor from the list.
     *
     * @returns {boolean} true if there was no open editor at this position
     */
    function removeAndCloseByPos(pos) {
        var addNew = true;
        _.remove(inlineEditors, function(editor) {
            if(editor.pos.line == pos.line) {
                editor.quickRequireEditor.close();
                addNew = false;
                return true;
            } else {
                return false;
            }
        });
        _closeInstallDialog();
        return addNew;

    }


    /**
     * the timestamp of the selected InlineEditor-Instance
     * @param timestampData
     */
    function removeAndCloseByTimestamp(timestampData) {
        _.remove(inlineEditors, function(editor) {
            if(editor.quickRequireEditor.requireEditor.timestamp === timestampData) {
                editor.quickRequireEditor.close();
                return true;
            } else {
                return false;
            }
        });
        _closeInstallDialog();
    }

    function _closeInstallDialog() {
        // Close the shown "openNpmInstallDialog-dialog"
        Dialogs.cancelModalDialogIfOpen('npm-install-dialog');
        $(document).find('.modal-wrapper').remove();
        StatusBar.hideBusyIndicator(INDICATOR_ID2);
    }


    function appendInlineWidget(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
            result;

        if (!context) {
            return null;
        } else {
            result = new $.Deferred();
            var quickRequireEditor = new InlineRequireEditor(context, apiOptions);
            quickRequireEditor.load(hostEditor);

            inlineEditors.push({
                quickRequireEditor: quickRequireEditor,
                pos: pos
            });
            result.resolve(quickRequireEditor);
            return result.promise();

        }
    }



    exports.completeLogger = completeLogger;
    exports.openSocketIoConnection = openSocketIoConnection;
    exports.openNpmInstallDialog = openNpmInstallDialog;
    exports.removeAndCloseByTimestamp = removeAndCloseByTimestamp;
    exports.initQuickRequire = initQuickRequire;
    exports.inlineEditors = inlineEditors;
    exports.removeAndCloseByTimestamp = removeAndCloseByTimestamp;

});