console.log('npmInstall.js');
process.on('message', function(m) { });

process.send('supper power left');
/*

var options = {moduleName: 'express', projectPath: ''},
    cb = function(err, data) { console.log(err, data) }
    var config = {};
    if (options.save) {
        config.save = true;
    }
    console.log('#2 npmInstall.js');
    npm.load(config, function() {
        npm.commands.install(options.projectPath, [options.moduleName], function(er, data) {
            if (er) {
                console.log('npmInstall.js: err', err);
                cb(er);
                return;
            }
            console.log('npmInstall.js: data', data);
            cb(null, data);
        });
    });
*/
