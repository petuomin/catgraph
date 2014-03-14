node analyze.js --format=deps core/*.js modules/*.js >deps.dot
node analyze.js --format=events core/*.js modules/*.js >events.dot
dot deps.dot -Tpng -o deps.png
dot events.dot -Tpng -o events.png
