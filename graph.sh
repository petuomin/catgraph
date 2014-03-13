node analyze.js core/*.js modules/*.js >koe.dot
dot koe.dot -Tpng -o kuva.png
