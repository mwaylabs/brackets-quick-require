// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var Strings = require("strings");
    var requireEditorTemplate = require("text!html/requireeditor.html");

    var moduleNameList = require("text!assets/tempTest.json");

    var requireNpmbridge = require("npmbridge");
    var quickrequire = require("quickrequire");
    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var test = require('loadModuleList');

    var parsedModuleList = null;

    //var moduleList = [];

    /**
     * Creates a new RequireEditor,
     * appends the html to the Editor
     *
     * @Constructor
     * @param {Array} $parent editor
     * @param {String} moduleName
     */
    function RequireEditor($parent, moduleName) {

        parsedModuleList = JSON.parse(moduleNameList);

        if (!$parent)
            throw new Error('$parent is not defined');
        if (moduleName || moduleName === '') {
            var matches = this.filterModules(moduleName);
            var templateVars = {
                Strings: Strings,
                matches: matches
            };
            var template = _.template(requireEditorTemplate, templateVars);
            this.parentElement = $parent;
            this.$element = $(template);
            this.parentElement.append(this.$element);
            this.setListeners();
            this.setTooltipListener();



        } else {
            throw new Error('moduleName is not defined');
        }
    }

    RequireEditor.prototype.setTooltipListener = function() {
        setTimeout(function() {
            // Configure twipsy
            var options = {
                placement: "above",
                trigger: "hover",
                title: function() {
                    return Strings.SAVE_IN_PACKAGE_JSON_TOOLTIP;
                }
            };
            // Show the twipsy with the explanation
            $('#flagTooltip').twipsy(options);
        }, 1000);
    };

    RequireEditor.prototype.getRootElement = function() {
        return this.$element;
    };

    /**
     * Updates (replaces) the module-list shown in the inline-editor
     *
     * @param {String} moduleName
     */
    RequireEditor.prototype.updateList = function(moduleName) {
        var matches = this.filterModules(moduleName);

        var templateVars = {
            Strings: Strings,
            matches: matches
        };
        if (matches.aaData.length > 500) {
            matches.aaData.splice(500, matches.aaData.length - 1);
        }
        var template = _.template(requireEditorTemplate, templateVars);
        var $element = $(template);
        $('.require-editor').replaceWith($element);
        this.setTooltipListener();
    };

    /**
     * returns a array with the matching modules
     *
     * @param {Object} module (requireEditor)
     */
    RequireEditor.prototype.filterModules = function(module) {
        var array = {};
        if (module.length <= 0) {
            array.aaData = [];
            array.initial = true;
            return array;
        }
        var matches = _.filter(parsedModuleList['rows'], function(element) {
            var a = element[0].search(module);

            if (a >= 0) {
                if (element[1].length > 53) {
                    element[1] = element[1].slice(0, 50);
                    element[1] = element[1] + '...';
                }

                return element;
            }
        });
        array = {
            aaData: matches
        };
        return array;
    };

    /**
     * register listeners
     *
     * register click-listener on '.install-module-btn'
     */
    RequireEditor.prototype.setListeners = function() {
        $(document).delegate('.install-module-btn', 'click', function(event) {

            // open the waiting dialog
            quickrequire.openNpmInstallDialog();

            //get the name of the selected module-name
            var selectedModulName = $(this.parentElement.parentElement).find('.ext-name').html();

            var savePackage = $('.require-editor table').find('#save-package').is(':checked');
            /**
             * give user feedback whether module-installation
             * was successfull or it has failed
             */
            var notifyUserCallback = function(err, data) {

                var _$mainToolbarTooltip = $('#main-toolbar #twipsyTooltip');
                $('#twipsyTooltip').remove();

                //append twipsy-tooltip div-container
                $('#main-toolbar').append('<div id="twipsyTooltip"> </div>');

                var $tempTwipsyDiv = $('#twipsyTooltip');

                var templateContent = null;
                var options = null;

                if (err) {
                    var $modalHtml = $('.npm-install-dialog .modal-body');
                    $modalHtml.html('<div class="status error">' + Strings.NOTIFICATON_ERROR_TITLE + ':  ' + Strings.ERROR_INVALID_NPM_MODULE + ' </div>');

                    templateContent = '<div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + Strings.NOTIFICATON_ERROR_TITLE + ':  ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + '</div>';
                    options = {
                        placement: "left",
                        trigger: "manual",
                        autoHideDelay: 5000,
                        title: function() {
                            return Strings.NOTIFICATON_INSTALL_NPMMODULE_TITLE;
                        },
                        template: templateContent
                    };
                    //Show twipsy with errormessage
                    $tempTwipsyDiv.twipsy(options).twipsy("show");
                    return;

                } else {
                    // Close the shown "install-dialog"
                    Dialogs.cancelModalDialogIfOpen('npm-install-dialog');

                    var currenInlineEditor = EditorManager.getActiveEditor().getInlineWidgets();

                    //
                    _.each(currenInlineEditor, function(inlineEditor) {
                        // Close if it's a require-editor
                        if (inlineEditor.hasOwnProperty('requireEditor')) {
                            inlineEditor.close();
                        }

                    });
                    //currenInlineEditor[0].close();
                    if (data) {
                        var installedModuleName = data[0][0];
                        templateContent = '<div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + installedModuleName + ' ' + Strings.NOTIFICATON_INSTALL_NPMMODULE_END + '</div>';

                        //configure twipsy
                        options = {
                            placement: "left",
                            trigger: "manual",
                            autoHideDelay: 5000,
                            title: function() {
                                return Strings.NOTIFICATON_INSTALL_NPMMODULE_TITLE;
                            },
                            template: templateContent
                        };
                        //Show twipsy with successmessage
                        $tempTwipsyDiv.twipsy(options).twipsy("show");

                        //Trigger the success-event
                        $(document).trigger('quickrequire-npm-installed', [data, selectedModulName, selectedModulName]);
                    }
                    $(document).undelegate('.install-module-btn', 'click');
                }
            };
            //run npm install with the selectedModulName
            requireNpmbridge.callNpmInstall(selectedModulName, savePackage, notifyUserCallback);
        });
    };
    exports.RequireEditor = RequireEditor;
});