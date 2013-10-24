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
    var exec = require('child_process').exec;
    var pytpl = require('node-pytpl-bin');

    // A slow useless function
    function slowFunction(times) {
        var i = 0,
        times = parseInt(1000000000 * times);
    
        while (i < times) {
          i += 1;
        }
    
        return times;
    }
    
    function handleResult(from, dest, err, stdout, code, done) {
        if(err){
            grunt.log.writeln(from + ': failed to compile to ' + dest + '.');
            grunt.log.writeln(stdout);
            if(!done){
                return;
            }            
            done(false);
        }else{
            grunt.log.writeln(from + ': compiled to ' + dest + '.');
            if(!done){
                return;
            }            
            done(true);
        }
    }    
    var processTemplate = function(src, dest, done)  {
        var pytplArgs = [pytpl.path, src, dest];
        
        var command = 'python.exe' + ' ' + pytplArgs.join(' ');
        exec(command, {}, function(err, stdout, code){
             handleResult(src, dest, err, stdout, code, done);
        });

        /*var child = grunt.util.spawn({
          cmd: 'python.exe',
          args: pytplArgs
        }, function (err, result, code) {
          var success = code === 0;
        });
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);*/
        
    };

    grunt.registerMultiTask('pytpl', 'Execute pytpl', function () {            
        var options = this.options();

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
              processTemplate(src, dest);
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
    slowFunction(1);
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

