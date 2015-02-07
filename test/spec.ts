/// <reference path="../node_modules/typescript/bin/typescript.d.ts"/>
/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>
import chai = require("chai");
import fs = require("fs");
import path = require("path");
import typescript = require("typescript");
require("../index");

var assert = chai.assert;

describe("typescript-register", () => {
    describe("require", () => {
        before(() => {
            process.env.TYPESCRIPT_REGISTER_USE_CACHE = "false";
        });

        after(() => {
            delete process.env.TYPESCRIPT_REGISTER_USE_CACHE;
        });

        it("should work for simple files", () => {
            var simple = require("./simple");
            assert.equal(simple.test, "test");
        });

        it("should be able to reference node modules", () => {
            var modules = require("./modules");
            assert.equal(modules.assert, assert);
        });

        it("should be able to handle references to other files", () => {
            var references = require("./references");
            var simple = require("./simple");
            assert.equal(references.test, simple.test);
        });
    });

    describe("emitErrors", () => {
        before(() => {
            process.env.TYPESCRIPT_REGISTER_USE_CACHE = "false";
        });

        after(() => {
            delete process.env.TYPESCRIPT_REGISTER_USE_CACHE;
        });

        it("should throw errors by default", () => {
            assert.throws(() => {
                require("./errors");
            });
        });

        it("should not throw errors if configured", () => {
            process.env.TYPESCRIPT_REGISTER_EMIT_ERROR = "false";
            require("./errors");
            delete process.env.TYPESCRIPT_REGISTER_EMIT_ERROR;
        });
    });

    describe("useCache", () => {
        before(() => {
            delete process.env.TYPESCRIPT_REGISTER_USE_CACHE;
            process.env.TYPESCRIPT_REGISTER_COMPILER_OPTIONS = JSON.stringify({
                module: typescript.ModuleKind.CommonJS,
                outDir: process.cwd(),
                target: typescript.ScriptTarget.ES5
            });
        });

        after(() => {
            delete process.env.TYPESCRIPT_REGISTER_COMPILER_OPTIONS;
        });

        it("should use the cache by default", () => {
            // Ensure it is in the cache
            require("./cached");
            var start = Date.now();
            require("./cached");
            var end = Date.now();
            assert.closeTo(end - start, 0, 10);
        });

        it("should not use the cache if configured", () => {
            process.env.TYPESCRIPT_REGISTER_USE_CACHE = "false";
            var start = Date.now();
            require("./uncached");
            var end = Date.now();
            assert.closeTo(end - start, 500, 300);
            delete process.env.TYPESCRIPT_REGISTER_USE_CACHE;
        });

        it("should check for cache invalidations", () => {
            fs.writeFileSync("invalidate.js", "exports.test = \"test\";\n");
            fs.writeFileSync(
                path.join(__dirname, "invalidate.ts"),
                "export var test = \"test\";\n");
            var start = Date.now();
            require("./invalidate");
            var end = Date.now();
            assert.closeTo(end - start, 0, 10);
        });
    });

    describe("compilerOptions", () => {
        it("should be able to not supply a target", () => {
            process.env.TYPESCRIPT_REGISTER_COMPILER_OPTIONS = JSON.stringify({
                module: typescript.ModuleKind.CommonJS,
                target: typescript.ScriptTarget.ES5
            });
            require("./cwd");
        });
    });
});
