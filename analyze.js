#!/usr/bin/env node

/*jslint sloppy:true plusplus:true node:true rhino:true */

var fs = require('fs'),
    esprima = require('esprima'),
    options = {},
    fnames = [], count;

function showUsage() {
    console.log('Usage:');
    console.log('   catgraph [options] file.js');
    console.log();
    //console.log('Available options:');
    //console.log();
    //console.log('  --format=type  Set the report format, plain (default) or junit');
    //console.log('  -v, --version  Print program version');
    //console.log();
    process.exit(1);
}

function repeat(s,n) {
    var r = '';
    for (; n>0; n--) {
        r += s;
    }
    return r;
}

function findDependencies(fname,syntax, depth, parent) {
    
    var rv, a, c, rest;
    var nextDepth = depth+1;
    var prefix = fname;
    //var prefix = repeat(' ',depth);
    var output = console.log.bind(console,prefix);
    var findNext = function (x) {
        return findDependencies (fname, x, nextDepth, syntax);
    };

    if (!syntax) { return '<nothing>'; }
    rv = '<' + syntax.type + '>';
    var displayName = syntax.name ? syntax.name :
                      typeof syntax.value !== 'object' ? syntax.value :
                      '';
    //output(syntax.type, displayName);//, Object.keys(syntax).join(' '));
    if (syntax.type == 'Program' ||
        syntax.type == 'BlockStatement') {
        syntax.body.forEach(findNext);
    } else if (syntax.type == 'MemberExpression') {
        rv = findNext(syntax.object) + '.' + findNext(syntax.property);
        if (!rv) output(syntax.object,syntax.property);
    } else if (syntax.type == 'VariableDeclaration') {
        syntax.declarations.forEach(findNext);
    } else if (syntax.type == 'ArrayExpression') {
        rv = syntax.elements.map(findNext);
    } else if (syntax.type == 'FunctionDeclaration') {
        findNext(syntax.body);
    } else if (syntax.type == 'FunctionExpression') {
        findNext(syntax.body);
        rv = '(function())';
    } else if (syntax.type == 'Identifier') {
        rv = syntax.name;
    } else if (syntax.type == 'ObjectExpression') {
        syntax.properties.forEach(findNext);
    } else if (syntax.type == 'ReturnStatement' ||
               syntax.type == 'UpdateExpression' ||
               syntax.type == 'ThrowStatement' ||
               syntax.type == 'UnaryExpression') {
        findNext(syntax.argument);
    } else if (syntax.type == 'ThisExpression') {
        rv = 'this';
    } else if (syntax.type == 'Property') {
        findNext(syntax.key);
        findNext(syntax.value);
    } else if (syntax.type == 'IfStatement' ||
               syntax.type == 'ConditionalExpression') {
        findNext(syntax.test);
        findNext(syntax.consequent);
        findNext(syntax.alternate);
    } else if (syntax.type == 'WhileStatement') {
        findNext(syntax.test);
        findNext(syntax.body);
    } else if (syntax.type == 'ForStatement') {
        findNext(syntax.init);
        findNext(syntax.test);
        findNext(syntax.update);
        findNext(syntax.body);
    } else if (syntax.type == 'ForInStatement') {
        findNext(syntax.left);
        findNext(syntax.right);
        findNext(syntax.body);
    } else if (syntax.type == 'VariableDeclarator') {
        findNext(syntax.init);
    } else if (syntax.type == 'AssignmentExpression') {
        findNext(syntax.left);
        findNext(syntax.right);
    } else if (syntax.type == 'ExpressionStatement') {
        findNext(syntax.expression);
    } else if (syntax.type == 'SwitchStatement') {
        findNext(syntax.discriminant);
        syntax.cases.forEach(findNext);
    } else if (syntax.type == 'SwitchCase') {
        findNext(syntax.test);
        syntax.consequent.forEach(findNext);
    } else if (syntax.type == 'TryStatement') {
        findNext(syntax.block);
        findNext(syntax.finalizer);
        syntax.handlers.forEach(findNext);
        syntax.guardedHandlers.forEach(findNext);
    } else if (syntax.type == 'CatchClause') {
        findNext(syntax.param);
        findNext(syntax.body);
    } else if (syntax.type == 'LogicalExpression' ||
               syntax.type == 'BinaryExpression') {
        findNext(syntax.left);
        findNext(syntax.right);
    } else if (syntax.type == 'Literal') {
        rv = syntax.value;
    } else if (syntax.type == 'ContinueStatement' ||
               syntax.type == 'BreakStatement' ||
               syntax.type == 'EmptyStatement') {
    } else if (syntax.type == 'CallExpression' ||
               syntax.type == 'NewExpression') {
        c = findNext(syntax.callee).toLowerCase();
        if (c == 'define') {
            var arg = findNext(syntax.arguments[0])
            for (a in arg) { output('require',arg[a]); }
            rest = syntax.arguments.slice(1);
        } else if (c == 'bus.on' || c == 'bus.emit' || c == 'require') {
            var arg = findNext(syntax.arguments[0])
            output(c.toLowerCase(),arg);
            rest = syntax.arguments.slice(1);
        } else {
            rest = syntax.arguments;
        }
        rest.forEach(findNext);
    } else {
        output('WHATSTHIS?',syntax);
    }
    return rv;
    
}

function handleFile(fname) {
    var content, timestamp, syntax, name;
    try {
        content = fs.readFileSync(fname, 'utf-8');

        if (content[0] === '#' && content[1] === '!') {
            content = '//' + content.substr(2, content.length);
        }

        timestamp = Date.now();
        syntax = esprima.parse(content, { tolerant: true });
        module.syntax = syntax;
        findDependencies(fname,syntax,0);
        //console.log(syntax);
        
    } catch (e) {
        console.log('Error: ' + e.message);
        throw e;
    }
}

if (process.argv.length <= 2) {
    showUsage();
}


process.argv.splice(2).forEach(function (entry) {

    if (entry === '-h' || entry === '--help') {
        showUsage();
    } else if (entry.slice(0, 2) === '--') {
        console.log('Error: unknown option ' + entry + '.');
        process.exit(1);
    } else {
        fnames.push(entry);
    }
});

if (fnames.length === 0) {
    console.log('Error: no input file.');
    process.exit(1);
}

fnames.forEach(handleFile);

