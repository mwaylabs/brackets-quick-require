// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    "use strict";

    var Strings = require("strings");
    var requireEditorTemplate = require("text!html/requireeditor.html");

    var moduleNameList = require("text!assets/moduleList.json");

    var requireNpmbridge = require("npmbridge");
    var quickrequire = require("quickrequire");
    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var Dialogs = brackets.getModule("widgets/Dialogs");

    var animator = require("animator/example")

    var INDICATOR_ID = 'install-npm-module';
    var INDICATOR_ID2 = 'installing-busy';

    var parsedModuleList = null;
    var searchInEntireWord = false;
    var StatusBar = brackets.getModule("widgets/StatusBar");
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
        searchInEntireWord = $('.require-editor table').find('#search-algo').is(':checked');
        var that = this;

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
        var $searchAlgoCheckbox = $('.require-editor table').find('#search-algo');
        $searchAlgoCheckbox.on('change', function(){
                that.updateList(moduleName);
        });

        if(searchInEntireWord) {
            $searchAlgoCheckbox.prop('checked', true);
        }
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



        var matches = [];
        if(!searchInEntireWord) {
            _.each(parsedModuleList['rows'], function(element) {
                var index = element[0].indexOf(module);
                if(index === 0) {
                    if (element[1].length > 53) {
                        element[1] = element[1].slice(0, 50);
                        element[1] = element[1] + '...';
                    }
                    matches.push(element);
                }
            });
        } else {
            matches = _.filter(parsedModuleList['rows'], function(element) {
                var a = element[0].search(module);

                /*var b = element[1].search(module);*/

                if (a >= 0 /*|| b >= 0*/) {
                    if (element[1].length > 53) {
                        element[1] = element[1].slice(0, 50);
                        element[1] = element[1] + '...';
                    }

                    return element;
                }
            });
        }

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

                var $tempTwipsyDiv = $('#install-npm-module');

                var templateContent = null;

                if (err) {

                    StatusBar.updateIndicator(INDICATOR_ID, true, "inspection-errors", err);
                    StatusBar.hideBusyIndicator(INDICATOR_ID2);

                    var $modalHtml = $('.npm-install-dialog .modal-body');
                    var errorContentDialog = '<div class="status error"><p>' + Strings.NOTIFICATON_ERROR_TITLE + ': ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + ' ' + Strings.NOTIFICATION_ERROR_DURING_NPMINSTALL +'</p><p> '+ err.errno + ': ' + err.code + ' </p> </div>'
                    $modalHtml.html(errorContentDialog);
                    $modalHtml.parent().find('.primary').remove();

                    templateContent = '<div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + Strings.NOTIFICATON_ERROR_TITLE + ':  ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + '</div>';
                    var options = {
                        placement: "left",
                        trigger: "manual",
                        autoHideDelay: 2000,
                        title: function() {
                            return selectedModulName;
                        },
                        template: function() {
                            return templateContent;
                        }
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
                        var installedModuleName = data[data.length-1][0];

                        templateContent = '<div id="' +installedModuleName+'"></div><div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + installedModuleName + ' ' + Strings.NOTIFICATON_INSTALL_NPMMODULE_END + '</div></div>';

                        //configure twipsy
                        var options = {
                            placement: "above",
                            trigger: "manual",
                            autoHideDelay: 2000,
                            title: function() {
                                return selectedModulName;
                            },
                            template: function() {
                                return templateContent;
                            }
                        };
                        $tempTwipsyDiv.twipsy(options).twipsy('show');


                        //Trigger the success-event
                        $(document).trigger('quickrequire-npm-installed', [data, selectedModulName, selectedModulName]);

                        StatusBar.updateIndicator(INDICATOR_ID, true, "inspection-valid", installedModuleName + ' ' + Strings.NOTIFICATON_INSTALL_NPMMODULE_END);

                        animator.show();
                    }
                    $(document).undelegate('.install-module-btn', 'click');
                }
                StatusBar.hideBusyIndicator(INDICATOR_ID2);
                setTimeout(function() {
                    // Bugfix for twipsy-caching
                    //$tempTwipsyDiv.twipsy('hide');

                }, 5100);
            };
            //run npm install with the selectedModulName
            requireNpmbridge.callNpmInstall(selectedModulName, savePackage, notifyUserCallback);
        });
    };
    exports.RequireEditor = RequireEditor;
});