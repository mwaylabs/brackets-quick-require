// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    'use strict';

    // Load modules
    var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;
    var RequireEditor = require("brackets-quick-require/requireeditor").RequireEditor;
    var quickrequire = require("brackets-quick-require/quickrequire");

    var Strings = require("brackets-quick-require/strings");

    var npmInstallCallback = null;
    var hideSaveFlag = null;
    var preRender = null;

    function InlineRequireEditor(context, options) {
        if (context && context.hasOwnProperty('start') && context.hasOwnProperty('cursorLine')) {
            hideSaveFlag = (options && options.hideSaveFlag) ? options.hideSaveFlag : false;
            preRender= (options && options.preRender) ? options.preRender : function() {return true};
            npmInstallCallback = (options && typeof options.npmInstall === 'function') ? options.npmInstall : null;
            this._start = context.start;
            this._cursorLine = context.cursorLine;
            this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

            InlineWidget.call(this);
        } else {
            throw new Error('Context not defined');
        }

    }

    InlineRequireEditor.prototype = new InlineWidget();
    InlineRequireEditor.prototype.constructor = InlineRequireEditor;
    InlineRequireEditor.prototype.parentClass = InlineWidget.prototype;


    InlineRequireEditor.prototype.requireEditor = null;
    InlineRequireEditor.prototype._start = null;
    /**
     * get RequireEditor instance
     */
    InlineRequireEditor.prototype.load = function(hostEditor) {
        InlineRequireEditor.prototype.parentClass.load.apply(this, arguments);
        var moduleName = this._checkValue() || '';
        var config = {
            moduleName: moduleName,
            $parent: this.$htmlContent,
            preRender: preRender
        };
        if(npmInstallCallback){
            config.npmInstall = npmInstallCallback;
        }
        this.requireEditor = new RequireEditor(config);
    };

    /**
     * bind change-event on the editordocument
     * calls addRef() the keep the full text content in memory
     *
     */
    InlineRequireEditor.prototype.onAdded = function() {
        InlineRequireEditor.prototype.parentClass.onAdded.apply(this, arguments);

        var doc = this.hostEditor.document;
        doc.addRef();
        $(doc).on("change", this._handleHostDocumentChange);

        this.hostEditor.setInlineWidgetHeight(this, this.requireEditor.getRootElement().outerHeight(), true);
    };

    /**
     * unbind change-event on the editordocument
     * release text content out of the memory [releaseRef()]
     */
    InlineRequireEditor.prototype.onClosed = function() {
        //keep the list clear
        quickrequire.removeAndCloseByTimestamp(this.requireEditor.timestamp);

        InlineRequireEditor.prototype.parentClass.onClosed.apply(this, arguments);

        var doc = this.hostEditor.document;
        $(doc).off("change", this._handleHostDocumentChange);
        $(document).undelegate('.install-module-btn', 'click');
        doc.releaseRef();
    };

    /**
     * Helper for updateList
     */
    InlineRequireEditor.prototype._handleHostDocumentChange = function() {
        var moduleName = this._checkValue();
        if (moduleName && typeof moduleName === 'string') {
            this.requireEditor.updateList(moduleName);
        } else {
            this.requireEditor.updateList('');
        }
    };

    /*
     * returns the name of the module, if it fits to the regex
     */
    InlineRequireEditor.prototype._checkValue = function() {
        var requireRegex = /(require\(['"])([a-zA-Z\w0-9_-\s]*)(["'\);]*)/;
        if (!this) {
            throw new Error('this is not defined');
        }
        if (!this._start.hasOwnProperty('line')) {
            throw new Error('line not defined');
        }
        var lineNumber = this._start.line;

        var line = this.hostEditor.document.getLine(lineNumber);
        var match = null;

        var tmp1 = requireRegex.exec(line);

        if (tmp1 && tmp1[2]) {
            match = tmp1[2];
        }
        //matched module-name
        return match;
    };
    module.exports = InlineRequireEditor;
});