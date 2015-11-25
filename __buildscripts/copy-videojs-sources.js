require('shelljs/global')

var fs = require('fs')
var process = require('process')
var exec = require('child_process').exec

function nm (val) {
  return 'node_modules/' + val
}

function videojs (val) {
  return nm('video.js') + '/dist/' + val
}

function media (val) {
  return nm('videojs-contrib-media-sources') + '/dist/' + val
}

function hls (val) {
  return nm('videojs-contrib-hls') + '/dist/' + val
}

function cpVideoJS () {
  console.log('> Copying video.js')
  cp('-f', videojs('video-js.min.css'), 'css')
  cp('-f', videojs('video-js.swf'), '.')
  cp('-f', videojs('video.js'), 'js')
  cp('-f', videojs('video.js.map'), 'js')
  cp('-f', videojs('video.min.js'), 'js')
  cp('-f', videojs('video.min.js.map'), 'js')

  rm('-rf', 'font')
  mkdir('font')
  cp('-f', videojs('font/*'), 'font')
}

function cpMedia () {
  console.log('> Copying videojs-contrib-media-sources')
  cp('-f', media('videojs-media-sources.min.js'), 'js')
}

function cpHLS () {
  console.log('> Copying videojs-contrib-hls')
  cp('-f', hls('videojs.hls.min.js'), 'js')
}

var cwd = process.cwd()

console.log('> Current directory: ' + cwd)
console.log('> Changing to the videojs-contrib-hls directory')
process.chdir(cwd + '/node_modules/videojs-contrib-hls/')

console.log('> Reading Gruntfile for videojs-contrib-hls')
var gruntFile = fs.readFileSync('Gruntfile.js', 'utf8')

console.log('> Preserving old Gruntfile')
mv('Gruntfile.js', 'OldGruntfile.js')

console.log('> Manipulating Gruntfile for videojs-contrib-hls')
gruntFile = gruntFile.replace(/(\s{4,}'test',)/, '/*$1*/')

console.log('> Writing Gruntfile for videojs-contrib-hls')
fs.writeFileSync('Gruntfile.js', gruntFile, 'utf8')

console.log('> Running npm install')
exec('npm install', function (err, stdout, stderr) {
  console.log(stdout)

  console.log('> Running grunt')
  exec('grunt', function (_err, _stdout, _stderr) {
    console.log(stdout)

    console.log('> Removing modified Gruntfile')
    rm('-f', 'Gruntfile.js')

    console.log('> Restoring old Gruntfile')
    mv('OldGruntfile.js', 'Gruntfile.js')

    console.log('> Changing back to the starting directory')
    process.chdir(cwd)

    cpVideoJS()
    cpMedia()
    cpHLS()
    console.log('')
  })
})
