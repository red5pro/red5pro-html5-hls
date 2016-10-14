require('shelljs/global')

rm('-rf', './dist')
mkdir('./dist')
mkdir('./dist/bundled')
mkdir('./dist/media')
mkdir('-p', './dist/lib/videojs')

cp('./bundled/bundle.js', './dist/bundled/')
cp('-r', './lib/videojs/', './dist/lib/videojs/')
cp('./media/demo.mp4', './dist/media/')
cp(['README.md', 'index.html', 'LICENSE'], './dist/')
