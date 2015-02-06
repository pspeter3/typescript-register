/// <reference path="node_modules/typescript/bin/typescript.d.ts"/>
/// <reference path="typings/node/node.d.ts"/>
import fs = require("fs");
import path = require("path");
import typescript = require("typescript");

/**
 * Requires a TypeScript file
 * @param {Module} module   The node module
 * @param {string} filename The module filename
 */
function req(module: Module, filename: string): void {
    var options = compilerOptions();
    var out = dest(filename, options);
    if (!useCache() || isModified(filename, out)) {
        compile(filename, options);
    }
    module._compile(fs.readFileSync(out, "utf8"), filename);
}

require.extensions[".ts"] = req;

/**
 * Checks the environment for whether or not we should emit an error. Defaults
 * to true.
 * @return {boolean} Whether or not to emit TypeScript errors
 */
function emitError(): boolean {
    return process.env.TYPESCRIPT_REGISTER_EMIT_ERROR || true;
}

/**
 * Checks the environment for whether or not we should use a build cache.
 * Defaults to true.
 * @return {boolean} Whether or not to use cached JavaScript files
 */
function useCache(): boolean {
    return process.env.TYPESCRIPT_REGISTER_USE_CACHE || true;
}

/**
 * Returns the JavaScript destination for the path
 * @param  {string}                      filename The TypeScript filename
 * @param  {typescript.CompilerOptiones} options  The Compiler Options
 * @return {string}                               The JavaScript filepath
 */
function dest(filename: string, options: typescript.CompilerOptions): string {
    var relativePath = path.relative(process.cwd(), filename);
    var outDir = options.outDir || process.cwd();
    return path.join(outDir, relativePath.replace(".ts", ".js"));
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
 * Compiles the TypeScript file
 * @param {string}                      filename The root file to compile
 * @param {typescript.CompilerOptiones} options  The Compiler Options
 */
function compile(filename: string, options: typescript.CompilerOptions): void {
    var host = typescript.createCompilerHost(options);
    var program = typescript.createProgram([filename], options, host);
    var source = program.getSourceFile(filename);
    var checker = program.getTypeChecker(true);
    if (emitError()) {
        checkErrors(checker.getDiagnostics());
    }
    checker.emitFiles(source);
}

/**
 * Checks the environment for JSON stringified compiler options. By default it
 * will compile TypeScript files into a scoped temp directory using ES5 and
 * CommonJS targets.
 * @return {typescript.CompilerOptions} The TypeScript compiler settings
 */
function compilerOptions(): typescript.CompilerOptions {
    var env: string = process.env.TYPESCRIPT_REGISTER_COMPILER_OPTIONS;
    if (env) {
        return <typescript.CompilerOptions>JSON.parse(env);
    }
    return {
        module: typescript.ModuleKind.CommonJS,
        outDir: path.join(path.sep, "tmp", "tsreq", process.cwd()),
        target: typescript.ScriptTarget.ES5
    };
}


/**
 * Converts a list of errors into something readable
 * @param  {typescript.Diagnostic[]} errors The TypeScript Diagnostics
 * @return {Error}                          The Compiler Error
 */
function checkErrors(errors: typescript.Diagnostic[]): void {
    if (errors.length === 0) {
        return;
    }
    var errorMessages = errors.map((err: typescript.Diagnostic): string => {
        return err.messageText;
    });
    throw new Error(errorMessages.join("\n\n"));
}

/**
 * The Module passed in by Node
 */
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
