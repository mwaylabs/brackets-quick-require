brackets-quick-require
======================
brackets-quick-require is a extension for Adobe Brackets that allows you to search and install node-modules out of the npm-registry - without even leaving the file where you want to use it.
The extension also allows you to set the 'save in package'-flag (`-S/--save`)

##Installation
There are in fact three different ways to add the quick-require extension to your Brackets-Editor.

- The Extension is available in the Brackets Extension Registry. So you are able to download it through the Brackets Extension Manager. There you will always find the latest stable release.

- Install via URL:
 	1. Open the the Extension Manager from the File menu.
 	2. Click on Install form URL...
 	3. Copy and paste following URL in the text field: `http://mwaylabs.github.io/brackets-quick-require/quickrequire-0.5.0.zip`
 	4. Click Install
 
- Install from file system
	1. [Download](http://mwaylabs.github.io/brackets-quick-require/quickrequire-0.5.0.zip) this extension as a zip file.
	2. Unzip it in Brackets' `/extensions/user` folder. You can get there by selecting Show Extension Folder in the Help menu.
	3. Reload Brackets.

##Usage
To run the extension, simply type `require("` in any javascript file and hit `CTRL/CMD + E`.

![a](http://mwaylabs.github.io/brackets-quick-require/howtouse.gif)

##Licence

The MIT License (MIT)

Copyright (c) 2014 M-Way Solutions GmbH.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
