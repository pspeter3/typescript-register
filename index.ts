/// <reference path="node_modules/typescript/bin/typescript.d.ts"/>
/// <reference path="typings/node/node.d.ts"/>
import fs = require("fs");
import path = require("path");
import typescript = require("typescript");

interface Module {
    id: string;
    exports: any;
    parent: Module;
    filename: string;
    loaded: boolean;
    children: Module[];
    paths: string[];
    _compile: (src: string, filename: string) => void;
}

/**
 * The compiler options
 * @type {typescript.CompilerOptions}
 */
var options: typescript.CompilerOptions = {
    module: typescript.ModuleKind.CommonJS,
    outDir: path.join(path.sep, "tmp", "tsreq"),
    target: typescript.ScriptTarget.ES5
};

/**
 * The compiler host
 * @type {typescript.CompilerHost}
 */
var host = typescript.createCompilerHost(options);

/**
 * Initializes the compiler host
 * @param {typescript.CompilerOptions} opts The compiler options
 */
function init(opts: typescript.CompilerOptions): void {
    options = opts;
    host = typescript.createCompilerHost(options);
}

/**
 * Returns the JavaScript destination for the path
 * @param  {string} filename The TypeScript filename
 * @return {string}          The JavaScript filepath
 */
function dest(filename: string): string {
    var outDir = options.outDir || process.cwd();
    var basename = path.basename(filename, ".ts");
    return path.join(outDir, basename + ".js");
}

/**
 * Check whether or not the path is modified
 * @param  {string}  tsPath The path to the TypeScript file
 * @param  {string}  jsPath The path to the JavaScript file
 * @return {boolean}        Whether or not the file is modified
 */
function isModified(tsPath: string, jsPath: string): boolean {
    try {
        var js = fs.statSync(jsPath).mtime;
        var ts = fs.statSync(tsPath).mtime;
        return ts > js;
    } catch (err) {
        return true;
    }
}

/**
 * Requires a TypeScript file
 * @param {Module} m        The node module
 * @param {string} filename The module filename
 */
function req(module: Module, filename: string): void {
    var out = dest(filename);
    if (isModified(filename, out)) {
        var program = typescript.createProgram([filename], options, host);
        var source = program.getSourceFile(filename);
        var checker = program.getTypeChecker(true);
        var errors = checker.getDiagnostics();
        if (errors.length > 0) {
            throw new Error(errors.map((err: typescript.Diagnostic) => {
                return err.messageText;
            }).join("\n"));
        }
        checker.emitFiles(source);
    }
    module._compile(fs.readFileSync(out, "utf8"), filename);
}

require.extensions[".ts"] = req;

export = init;
