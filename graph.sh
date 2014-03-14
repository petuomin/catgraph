node analyze.js --format=deps core/*.js modules/*.js >deps.dot
node analyze.js --format=events core/*.js modules/*.js json!modules/Toolbar_files/Toolbar_config.json >events.dot
dot deps.dot -Tpng -o deps.png
dot events.dot -Tpng -o events.png
