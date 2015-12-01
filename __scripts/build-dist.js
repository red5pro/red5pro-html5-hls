require('shelljs/global')

rm('-rf', './dist')
mkdir('./dist')
mkdir('./dist/js')
mkdir('./dist/media')
mkdir('./dist/videojs')

cp(['./js/bundle.js', './js/videojs-media-sources.min.js', './js/videojs.hls.min.js'], './dist/js/')
cp('-r', './videojs/', './dist/videojs/')
cp('./media/demo.mp4', './dist/media/')
cp(['README.md', 'index.html', 'LICENSE'], './dist/')
