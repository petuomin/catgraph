node analyze.js --format=deps core/*.js modules/*.js >deps.dot
node analyze.js --format=deps core/*.js >deps-core.dot
node analyze.js --format=deps modules/*.js >deps-modules.dot
node analyze.js --format=events core/*.js modules/*.js json!modules/Toolbar_files/Toolbar_config.json >events.dot
dot deps.dot -Tpng -o deps.png
dot deps-core.dot -Tpng -o deps-core.png
dot deps-modules.dot -Tpng -o deps-modules.png
dot events.dot -Tpng -o events.png
