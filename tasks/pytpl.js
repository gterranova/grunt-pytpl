/*
 * grunt-pytpl
 * https://github.com/gterranova/grunt-pytpl
 *
 * Copyright (c) 2013 Gianpaolo Terranova
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    var path = require('path');
    var spawn = require('child_process').spawn;
    var pytpl = require('node-pytpl-bin');
    
    var processTemplate = function(src, dest, cb)  {
        var pytplArgs = [pytpl.path, src, dest];
        grunt.verbose.writeflags(pytplArgs, 'Options');

        var child = grunt.util.spawn({
          cmd: 'python.exe',
          args: pytplArgs
        }, function (err, result, code) {
          var success = code === 0;
          grunt.verbose.writeln('Result: ' + result.cyan);
          cb(success);
        });
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        
    };

    grunt.registerMultiTask('pytpl', 'Execute pytpl', function () {            
        var options = this.options();
        var cb = this.async();

        grunt.verbose.writeflags(options, 'Options');

        var dest;
        var isExpandedPair;
        var tally = {
            dirs: 0,
            files: 0
        };

        this.files.forEach(function(filePair) {
          isExpandedPair = filePair.orig.expand || false;
    
          filePair.src.forEach(function(src) {
            if (detectDestType(filePair.dest) === 'directory') {
              dest = (isExpandedPair) ? filePair.dest : unixifyPath(path.join(filePair.dest, src));
            } else {
              dest = filePair.dest;
            }
            dest = dest.replace(/\.tpl$/i, '');
            
            if (grunt.file.isDir(src)) {
              grunt.verbose.writeln('Creating ' + dest.cyan);
              grunt.file.mkdir(dest);
              tally.dirs++;
            } else {
              grunt.verbose.writeln('Process ' + src.cyan + ' -> ' + dest.cyan);
              processTemplate(src, dest, cb);
              tally.files++;
            }
          });
        });

    if (tally.dirs) {
      grunt.log.write('Created ' + tally.dirs.toString().cyan + ' directories');
    }

    if (tally.files) {
      grunt.log.write((tally.dirs ? ', processed ' : 'Processed ') + tally.files.toString().cyan + ' files');
    }

    grunt.log.writeln();
  });

  var detectDestType = function(dest) {
    if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };

  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };
};

