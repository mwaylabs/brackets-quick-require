// Copyright (c) 2014 M-Way Solutions GmbH
// https://github.com/mwaylabs/brackets-quick-require/blob/master/LICENCE

define(function(require, exports, module) {
    'use strict';

    var SpecRunnerUtils = brackets.getModule("spec/SpecRunnerUtils"),
        FileUtils = brackets.getModule("file/FileUtils"),
        ExtensionLoader,
        DocumentManager;

    var InlineRequireEditor,
        npmbridge,
        quickrequire,
        RequireEditor;

    var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;



    describe('quick-require', function() {
        var testFolder = FileUtils.getNativeModuleDirectoryPath(module) + "/unittest-files/";

        // load from testWindow
        var testWindow,
            brackets,
            extensionRequire,
            CommandManager,
            Commands,
            EditorManager,
            QuickView,
            editor,
            testInlineRequireEditor;

        beforeFirst(function() {

            // Create a new window that will be shared by ALL tests in this spec.
            if (!testWindow) {
                runs(function() {
                    SpecRunnerUtils.createTestWindowAndRun(this, function(w) {
                        testWindow = w;
                        // Load module instances from brackets.test
                        brackets = testWindow.brackets;
                        CommandManager = brackets.test.CommandManager;
                        Commands = brackets.test.Commands;
                        EditorManager = brackets.test.EditorManager;
                        /*extensionRequire = brackets.test.ExtensionLoader.getRequireContextForExtension("QuickView");
                        QuickView = extensionRequire("main");*/
                        DocumentManager     = testWindow.brackets.test.DocumentManager;
                        ExtensionLoader     = testWindow.brackets.test.ExtensionLoader;

                        extensionRequire = testWindow.brackets.getModule("utils/ExtensionLoader").getRequireContextForExtension("quick-require");
                        debugger;
                        InlineRequireEditor = extensionRequire('inlinerequireeditor');
                        npmbridge = extensionRequire('npmbridge');
                        quickrequire = extensionRequire('quickrequire');
                        RequireEditor = extensionRequire('requireeditor').RequireEditor;
                    });
                });

                runs(function() {
                    SpecRunnerUtils.loadProjectInTestWindow(testFolder);
                });

                runs(function() {
                    waitsForDone(SpecRunnerUtils.openProjectFiles(["test.js"]), "open test file");
                });

                runs(function() {
                    editor = EditorManager.getCurrentFullEditor();
                });


                //
                runs(function() {
                    testInlineRequireEditor = new InlineRequireEditor({
                        start: {
                            line: 0,
                            ch: 1
                        },
                        cursorLine: {
                            line: 0
                        }
                    });
                    testInlineRequireEditor.load(editor);
                });
            }
        });

        afterLast(function() {
            testWindow = null;
        })



        describe('InlineRequireEditor', function() {


            it('Object define', function() {
                expect(InlineRequireEditor).toEqual(jasmine.any(Function));
                expect(function() {
                    new InlineRequireEditor();
                }).toThrow('Context not defined');

                expect(function() {
                    new InlineRequireEditor({});
                }).toThrow('Context not defined');

                expect(function() {
                    new InlineRequireEditor({
                        start: ''
                    });
                }).toThrow('Context not defined');

                expect(function() {
                    new InlineRequireEditor({
                        start: null
                    });
                }).toThrow('Context not defined');

                expect(function() {
                    new InlineRequireEditor({
                        cursorLine: ''
                    });
                }).toThrow('Context not defined');

                expect(function() {
                    new InlineRequireEditor({
                        cursorLine: null
                    });
                }).toThrow('Context not defined');


                var t1 = new InlineRequireEditor({
                    start: null,
                    cursorLine: null
                });

                expect(InlineRequireEditor.prototype.isPrototypeOf(t1)).toEqual(true);

                expect(InlineRequireEditor.prototype.requireEditor).toBe(null);

                expect(InlineRequireEditor.prototype._start).toBe(null);

                t1 = null;
            });

            it('load', function() {
                var t1 = new InlineRequireEditor({
                    start: {
                        line: 0,
                        ch: 1
                    },
                    cursorLine: {
                        line: 0
                    }
                });
                t1.load(editor);


                var testHostEditor = EditorManager.getCurrentFullEditor();

                expect(t1.load).toEqual(jasmine.any(Function));


                t1 = null;

            });



            it('onAdded', function() {


                var t1 = new InlineRequireEditor({
                    start: {
                        line: 0,
                        ch: 1
                    },
                    cursorLine: {
                        line: 0
                    }
                });

                t1.load(editor);

                expect(t1.onAdded).toEqual(jasmine.any(Function));
                //fails
                //expect(t1.hostEditor).toBeTruthy();

            });

            it('onClosed', function() {

                var t1 = new InlineRequireEditor({
                    start: {
                        line: 0,
                        ch: 1
                    },
                    cursorLine: {
                        line: 0
                    }
                });
                t1.load(editor);

                expect(t1.onAdded).toEqual(jasmine.any(Function));

            });


            it('_checkValue', function() {
                var hostEdit = EditorManager.getCurrentFullEditor();

                expect(hostEdit).toBeTruthy();

                expect(testInlineRequireEditor._checkValue).toEqual(jasmine.any(Function));
                expect(testInlineRequireEditor._checkValue()).toBe("test");


                // Little workaround for requirejs.
                // if you type 'require("foo")', requirejs will freak out
                // and tries to load "foo" - even if it's String
                var testFileContent = 'req' + 'uire("test")';
                // set file-content 
                testInlineRequireEditor.hostEditor.document.setText(testFileContent);
                expect(testInlineRequireEditor._checkValue()).toEqual("test");

            });

        });


        // QUICKREQUIRE

        describe('quickrequire', function() {

            it('initQuickRequire should be a function', function() {
                expect(quickrequire.initQuickRequire).toEqual(jasmine.any(Function));

            });

        });

        describe('RequireEditor', function() {

            it('RequireEditor should be a Function', function() {
                expect(RequireEditor).toEqual(jasmine.any(Function));
            });

            it('RequireEditor Object define', function() {

                expect(function() {
                    new RequireEditor();
                }).toThrow('Options are not defined!');

                var parent = {};
                expect(function() {
                    new RequireEditor({$parent: parent, hideSaveFlag: false});
                }).toThrow('moduleName is not defined');

                var moduleName = 'String';
                expect(function() {
                    new RequireEditor({$parent: null, hideSaveFlag: false, moduleName : 'module Name'});
                }).toThrow('$parent is not defined');

            });


            var parent, re1 = null;
            beforeEach(function() {
                parent = testWindow.window.document.getElementById('editor-holder');
                parent = $(parent);
                debugger;
                re1 = new RequireEditor({$parent: parent, hideSaveFlag: false, moduleName : 'module Name'});
                spyOn(re1, 'setListeners');


            });


            it('RequireEditor.getRootElement should be a Function', function() {
                expect(re1.getRootElement).toEqual(jasmine.any(Function));
            });




            it('updateList should be a Function', function() {
                expect(re1.updateList).toEqual(jasmine.any(Function));
            });

            it('updateList should be a Function', function() {
                expect(re1.updateList).toEqual(jasmine.any(Function));
            });

            it('updateList should replace html', function() {

                var oldElement = $('.require-editor');
                //updateList()
                re1.updateList('jquery');
                var newElement = $('.require-editor');

                expect(oldElement).not.toBe(newElement);

            });



            it('filterModules should be a Function', function() {
                expect(re1.filterModules).toEqual(jasmine.any(Function));
            });

            it('setListeners should be a Function', function() {
                expect(re1.setListeners).toEqual(jasmine.any(Function));
            });









        });



        // QUICKREQUIRE

        describe('quickrequire', function() {

            it('initQuickRequire should be a function', function() {
                expect(quickrequire.initQuickRequire).toEqual(jasmine.any(Function));

            });

        });


        //NPMBRIDGE

        describe('npmbridge', function() {

            it('should be a object', function() {
                expect(npmbridge).toEqual(jasmine.any(Object));
            });

            it('should throw error', function() {
                expect(function() {
                    npmbridge.callNpmInstall();
                }).toThrow('invalid params');
            });

            it('should throw error', function() {
                expect(function() {
                    npmbridge.callNpmInstall('');
                }).toThrow('invalid params');
            });

            it('should throw error', function() {
                expect(function() {
                    npmbridge.callNpmInstall('module name');
                }).toThrow('invalid params');
            });

            it('should throw error', function() {
                expect(function() {
                    npmbridge.callNpmInstall(null, function() {});
                }).toThrow('invalid params');
            });

        });





        // This must be in the last spec in the suite.
        runs(function() {
            this.after(function() {
                testWindow = null;
                brackets = null;
                CommandManager = null;
                Commands = null;
                EditorManager = null;
                extensionRequire = null;
                QuickView = null;
                testInlineRequireEditor = null;
                SpecRunnerUtils.closeTestWindow();
            });
        });
    });
});