/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function(require, exports, module) {
    'use strict';

    // Load modules
    var RequireEditor = require("requireeditor").RequireEditor;
    var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;

    function InlineRequireEditor(context) {
        if (context && context.hasOwnProperty('start') && context.hasOwnProperty('cursorLine')) {

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
        this.requireEditor = new RequireEditor(this.$htmlContent, moduleName);
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
        InlineRequireEditor.prototype.parentClass.onClosed.apply(this, arguments);

        var doc = this.hostEditor.document;
        $(doc).off("change", this._handleHostDocumentChange);
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