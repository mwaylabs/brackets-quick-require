#update-manager

**update-manager** is a simple to use Node Packaged Module to keep all your files up to date.

There are several different use-cases. For example you can use it to deliver continuously new versions of your files. You can also use it for lazy loading.

##How it works
The usage is quit simple. You simply call the update-manager with a config object which contains a `extractPath` and a URL to a `version.json`.

Everytime the update-manager is called, he compares the local version and the remote version. If the remote version is greater than the local, the download starts automatically.

###Installation

`npm install update-manager`

###The version file

    {
        "version": "1.1.1",
        "updateURL": "http://example.com/path/to/your/files.zip"
    }

###How to use

    var updateManager = require('update-manager');
    
    var config = {
        updateVersionURL: 'http://example.com/path/to/your/version.json',
        extractPath: 'global/path/to/your/dest'
    }
    
    // everytime init() is called, the update-manager looks for a new available version
    function init() {
        updateManager.update(config);
    }

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
