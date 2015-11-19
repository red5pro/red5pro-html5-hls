require('shelljs/global');

mkdir('-p', 'css');
mkdir('-p', 'js');
mkdir('-p', 'fonts');

var base = 'node_modules/bootstrap/dist/';

cp('-f', base+'css/*.min.css', 'css');
cp('-f', base+'js/*.min.js', 'js');
cp('-fr', base+'fonts/*', 'fonts');
