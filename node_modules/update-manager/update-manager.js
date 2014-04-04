"use strict";
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var semver = require('semver');
var AdmZip = require('adm-zip');
var mkdirp = require('mkdirp');


var doLog = false;

/**
 * parses the given URL and passes to handler
 * @param {options} contains URL to the remote version-file
 */
function update(options) {

    var reqOpt = {
        host: url.parse(options.updateVersionURL).host,
        uri: url.parse(options.updateVersionURL),
        path: url.parse(options.updateVersionURL).pathname,
        port: options.port
    };

    options.error = options.error || function () {
    };
    options.success = options.success || function () {
    };


    doLog = options.log || false;
    console.log('should i log: ', doLog);
    log(doLog);
    _handleUpdateProcess(reqOpt, options);
}

function _handleUpdateProcess(reqOpt, options) {
    var parsedVersionFile = null;
    log('_handleUpdateProcess', reqOpt);
    console.log('_handleUpdateProcess');
    if (reqOpt && reqOpt.host) {
        //get the remote version file
        var chunks = '';
        try {
            log('call GET', reqOpt);
            var req = http.get(reqOpt, function (res) {

                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    console.log('1', chunk);
                    chunks += chunk;
                });

                res.on('end', function () {
                    console.log('end', chunks);
                    log('req. end', chunks);
                    parsedVersionFile = JSON.parse(chunks);
                    decideGetNewFiles(parsedVersionFile, options);
                });

                res.on('error', function () {
                    console.log('error');
                    var e = 'remote version file not found. unable to update';
                    log(e);
                    options.error(e);
                });
            });
        } catch (e) {
            log(e);
            options.error(e);
        }
    } else {
        log('no host');
        options.error('no host');
    }
}

function decideGetNewFiles(parsedVersionFile, options) {

    var localVersionFile = null;

    //set filepath
    var filePath = path.normalize(options.extractPath);

    try {
        localVersionFile = fs.readFileSync(filePath + 'version.json', 'utf8');
    } catch (e) {
        log(e);
        log('try to get the files from remote');
        // if there is no version.json locally, go and get it
        _getZipFile(parsedVersionFile, filePath, options);
        return;
    }


    try {
        localVersionFile = JSON.parse(localVersionFile);
    } catch (e) {
        log(e);
        _getZipFile(parsedVersionFile, filePath, options);
        log('try to get the files from remote');
        return;
    }


    _helperDecisionMaker(parsedVersionFile, localVersionFile, filePath, options);

}

function _helperDecisionMaker(parsedVersionFile, localVersionFile, filePath, options) {
    if (!parsedVersionFile || !localVersionFile) {
        options.error('corrupt online and offline version.json file');
        return;
    }

    var remoteVersionNum = semver.valid(parsedVersionFile.version);
    var localVersionNum = semver.valid(localVersionFile.version);

    // if the local version number is invalid, get the new files
    if (!localVersionNum) {
        _getZipFile(parsedVersionFile, filePath, options);
        return;
    }

    // if the remote version number is invalid, do nothing
    if (!remoteVersionNum) {
        return;
    }

    //compare version numbers
    if (semver.lt(localVersionNum, remoteVersionNum)) {
        //update files
        _getZipFile(parsedVersionFile, filePath, options);

    } else {
        //everything is up-to-date, do nothing
        options.success(1, 'everything is up-to-date, do nothing');
    }
}

function _getZipFile(parsedVersionFile, filePath, options) {
    var _options = {
        host: url.parse(parsedVersionFile.updateURL).host,
        uri: url.parse(parsedVersionFile.updateURL),
        path: url.parse(parsedVersionFile.updateURL).pathname,
        port: parsedVersionFile.port,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip,deflate,sdch"
        }
    };


    /**
     * build backup
     */
    var oldFiles = new AdmZip();
    try {
        mkdirp.sync(filePath);
    } catch (e) {
        log(e);
        options.error(e);
        return;
    }

    log(filePath);
    oldFiles.addLocalFolder(filePath);

    oldFiles.toBuffer();

    var zipName = filePath + Date.now() + '.zip';
    oldFiles.writeZip(zipName);

    try {
        log('connection to', _options);
        // get the zip file, described in the version file
        var req = http.get(_options, function (res) {
            var data = [],
                dataLen = 0;
            res.on('data', function (chunk) {
                data.push(chunk);
                dataLen += chunk.length;

            }).on('end', function () {
                var buf = new Buffer(dataLen);

                for (var i = 0, len = data.length, pos = 0; i < len; i++) {
                    data[i].copy(buf, pos);
                    pos += data[i].length;
                }

                var zip = new AdmZip(buf);
                var zipEntries = zip.getEntries();

                //path, overwrite
                zip.extractAllTo(filePath, true);


                //remove backup.zip

                //unlinkFile(zipName);
                fs.unlink(zipName, function (err) {
                    if (err) throw err;
                    log('successfully deleted', zipName);
                    options.success(2, 'updated: ' + filePath);
                });
            });
        });

        req.on('error', function (err) {
            log(err, '!!!!!!');
            //restore old files
            oldFiles.extractAllTo(zipName, true);
            //unlinkFile(zipName);
            fs.unlink(zipName, function (err) {
                if (err) {
                    options.error(err);
                }
                log('successfully deleted', zipName);
                options.error('something went wrong, revert to old version');
            });
        });

        req.end();
    } catch (e) {
        log(e);
        options.error(e);
    }
}


function log() {
    if (doLog) {
        console.log.apply(console, arguments);
    }
}

module.exports.update = update;
