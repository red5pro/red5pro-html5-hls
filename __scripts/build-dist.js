require('shelljs/global')

rm('-rf', './dist')
mkdir('./dist')
mkdir('./dist/bundled')
mkdir('./dist/media')

cp('./bundled/bundle.js', './dist/bundled/')
cp('./media/demo.mp4', './dist/media/')
cp(['README.md', 'index.html', 'LICENSE'], './dist/')
