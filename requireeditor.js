define(function(require, exports, module) {
    "use strict";

    var Strings = require("strings");
    var requireEditorTemplate = require("text!html/requireeditor.html");
    var moduleList = require("assets/package");
    var requireNpmbridge = require("npmbridge");
    var quickrequire = require("quickrequire");
    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var Dialogs = brackets.getModule("widgets/Dialogs");

    /**
     * Creates a new RequireEditor,
     * appends the html to the Editor
     *
     * @Constructor
     * @param {Array} $parent editor
     * @param {String} moduleName
     */
    function RequireEditor($parent, moduleName) {
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
        } else {
            throw new Error('moduleName is not defined');
        }

    }

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

        var template = _.template(requireEditorTemplate, templateVars);
        var $element = $(template);
        $('.require-editor').replaceWith($element);
    };

    /**
     * returns a array with the matching modules
     *
     * @param {Object} module (requireEditor)
     */
    RequireEditor.prototype.filterModules = function(module) {
        var array = {};
        var matches = _.filter(moduleList.aaData, function(element) {
            var a = element[0].search(module);
            if (a >= 0) {
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
                    debugger;

                    //
                    _.each(currenInlineEditor, function(inlineEditor) {
                        debugger;
                        // Close if it's a require-editor
                        if (inlineEditor.hasOwnProperty('requireEditor')) {
                            inlineEditor.close();
                        }

                    });
                    //currenInlineEditor[0].close();

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


            };

            //run npm install with the selectedModulName
            requireNpmbridge.callNpmInstall(selectedModulName, notifyUserCallback);

        });

    };

    exports.RequireEditor = RequireEditor;
});