CORE="`find core/ -not -name Application.js -name \*.js`"
MODULES="`find modules/ -name \*.js` json!modules/Toolbar_files/Toolbar_config.json"
APP="core/Application.js"
node analyze.js --format=deps ${CORE} ${MODULES} ${APP} >deps.dot
node analyze.js --format=deps ${CORE} >deps-core.dot
node analyze.js --core=sink --format=deps ${MODULES} >deps-modules.dot
node analyze.js --format=events ${CORE} ${MODULES} ${APP} >events.dot
dot deps.dot -Tpng -o deps.png
dot deps-core.dot -Tpng -o deps-core.png
dot deps-modules.dot -Tpng -o deps-modules.png
dot events.dot -Tpng -o events.png
