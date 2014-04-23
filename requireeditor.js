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

    var animator = require("animator/example");

    var INDICATOR_ID = 'install-npm-module';
    var INDICATOR_ID2 = 'installing-busy';

    var parsedModuleList = null;
    var searchInEntireWord = false;
    var StatusBar = brackets.getModule("widgets/StatusBar");

    var quickrequire = require("quickrequire");
    var currentTimestamp = null;
    var selectedModulName = null;

    /**
     * Creates a new RequireEditor,
     * appends the html to the Editor
     *
     * @Constructor
     * @param {Array} $parent editor
     * @param {String} moduleName
     */
    function RequireEditor($parent, moduleName) {
        this.timestamp = new Date().getTime();
        parsedModuleList = JSON.parse(moduleNameList);

        if (!$parent)
            throw new Error('$parent is not defined');
        if (moduleName || moduleName === '') {
            var matches = this.filterModules(moduleName);
            var templateVars = {
                Strings: Strings,
                matches: matches,
                timestamp: this.timestamp
            };

            var template = _.template(requireEditorTemplate, templateVars);
            this.parentElement = $parent;
            this.$element = $(template);
            this.parentElement.append(this.$element);
            this.parentElement.data('timestamp', this.timestamp);
            if(moduleName !== '') {
                registerClickEvent(this.$element);
            }

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

            $(this.$element).find('#flagTooltip').twipsy(options);
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
        //this.$element
        searchInEntireWord = $(this.$element).find('#search-algo').is(':checked');
        var that = this;

        var matches = this.filterModules(moduleName);

        var templateVars = {
            Strings: Strings,
            matches: matches
        };
        if (matches.aaData.length > 200) {
            matches.aaData.splice(200, matches.aaData.length - 1);
        }
        var template = _.template(requireEditorTemplate, templateVars);
        var $element = $(template);


        unregisterEvent(this.$element);
        $(this.$element).replaceWith($element);
        this.$element = $element;
        registerClickEvent(this.$element);
        //$('.require-editor').replaceWith($element);
        var $searchAlgoCheckbox = $(this.$element).find('#search-algo');
        $searchAlgoCheckbox.on('change', function(){
            that.updateList(moduleName);
        });

        if(searchInEntireWord) {
            $searchAlgoCheckbox.prop('checked', true);
        }
        this.setTooltipListener();

    };

    function registerClickEvent($element) {
        $($element).find('.install-module-btn').on('click', function() {
            var $parentInlineEditor = $(this).parents('.inline-widget');
            currentTimestamp = $parentInlineEditor.data('timestamp');
            var savePackage = $(this).parents('.inline-widget').find('#save-package').is(':checked');
            // open the waiting dialog
            quickrequire.openNpmInstallDialog(currentTimestamp);
            selectedModulName = _getClickedModuleName(this);

            //run npm install with the selectedModulName
            console.log(selectedModulName, savePackage);
            requireNpmbridge.callNpmInstall(selectedModulName, savePackage, notifyUserCallback);


        });
    }
    function unregisterEvent($element) {
        $($element).find('.install-module-btn').off('click');
    }
    function _getClickedModuleName(clickedEl) {
        return $(clickedEl.parentElement.parentElement).find('.ext-name').html();
    }

    function _showErrorMsg(err){
        var $modalHtml = $('.npm-install-dialog .modal-body');
        var errorContentDialog = '<div class="status error"><p>' + Strings.NOTIFICATON_ERROR_TITLE + ': ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + ' ' + Strings.NOTIFICATION_ERROR_DURING_NPMINSTALL +'</p><p> '+ err.errno + ': ' + err.code + ' </p> </div>'
        $modalHtml.html(errorContentDialog);
        $modalHtml.parent().find('.primary').remove();
    }
    function _showErrorTwipsy($tempTwipsyDiv) {
        var templateContent = '<div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + Strings.NOTIFICATON_ERROR_TITLE + ':  ' + Strings.NOTIFICATON_ERROR_MESSAGE_PAST + '</div>';
        var options = {
            placement: "above",
            trigger: "manual",
            autoHideDelay: 3000,
            template: function() {
                return templateContent;
            }
        };
        //Show twipsy with errormessage
        $tempTwipsyDiv.data('twipsy', null);
        $tempTwipsyDiv.twipsy(options).twipsy("show");
    }

    function _closeInstallDialog() {
        // Close the shown "openNpmInstallDialog-dialog"
        Dialogs.cancelModalDialogIfOpen('npm-install-dialog');
        $(document).find('.modal-wrapper').remove();
    }

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

            _showErrorMsg(err);

            _showErrorTwipsy($tempTwipsyDiv);
            return;

        } else {
            _closeInstallDialog();
            quickrequire.removeAndCloseByTimestamp(currentTimestamp);

            if (data) {
                var installedModuleName = data[data.length-1][0];

                templateContent = '<div class="tooltip-arrow"></div><div class="tooltip-innerQuickRequire">' + installedModuleName + ' ' + Strings.NOTIFICATON_INSTALL_NPMMODULE_END + '</div>';

                //configure twipsy
                var options = {
                    placement: "above",
                    trigger: "manual",
                    autoHideDelay: 3000,
                    template: function() {
                        return templateContent;
                    }
                };
                $tempTwipsyDiv.data('twipsy', null);
                $tempTwipsyDiv.twipsy(options).twipsy('show');


                //Trigger the success-event
                $(document).trigger('quickrequire-npm-installed', [data, selectedModulName, selectedModulName]);

                StatusBar.updateIndicator(INDICATOR_ID, true, "inspection-valid", installedModuleName + ' ' + Strings.NOTIFICATON_INSTALL_NPMMODULE_END);

                animator.show();
            }
            $(document).undelegate('.install-module-btn', 'click');
        }
        StatusBar.hideBusyIndicator(INDICATOR_ID2);
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





    RequireEditor.prototype.setListeners = function() {

    };
    exports.RequireEditor = RequireEditor;
});