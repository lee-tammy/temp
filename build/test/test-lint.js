"use strict";
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const lint = __importStar(require("../src/lint"));
const util_1 = require("../src/util");
const fixtures_1 = require("./fixtures");
const OPTIONS = {
    gtsRootDir: path.resolve(__dirname, '../..'),
    targetRootDir: './',
    dryRun: false,
    yes: false,
    no: false,
    logger: { log: util_1.nop, error: util_1.nop, dir: util_1.nop }
};
const BAD_CODE = `throw 'hello world';`;
const GOOD_CODE = `throw new Error('hello world');`;
// missing semicolon, array-type simple.
const FIXABLE_CODE = 'const x : Array<string> = []';
const FIXABLE_CODE_FIXED = 'const x : string[] = [];';
ava_1.default.serial('createProgram should return an object', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': '{}' }, () => __awaiter(this, void 0, void 0, function* () {
        const program = lint.createProgram(OPTIONS);
        t.truthy(program);
    }));
});
ava_1.default.serial('lint should return true on good code', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': GOOD_CODE,
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, true);
    }));
});
ava_1.default.serial('lint should return false on bad code', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': BAD_CODE,
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, false);
    }));
});
ava_1.default.serial('lint should auto fix fixable errors', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': FIXABLE_CODE
    }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS, [], true);
        t.is(okay, true);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, FIXABLE_CODE_FIXED);
    }));
});
ava_1.default.serial('lint should not auto fix on dry-run', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': FIXABLE_CODE
    }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const optionsWithDryRun = Object.assign({}, OPTIONS, { dryRun: true });
        const okay = lint.lint(optionsWithDryRun, [], true);
        t.is(okay, false);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, FIXABLE_CODE);
    }));
});
ava_1.default.serial('lint should lint files listed in tsconfig.files', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, true);
    }));
});
ava_1.default.serial('lint should lint *.ts files when no files or inlcude has been specified', (t) => __awaiter(this, void 0, void 0, function* () {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({}),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, false);
    }));
}));
ava_1.default.serial('lint should lint files listed in tsconfig.files when empty list is provided', (t) => __awaiter(this, void 0, void 0, function* () {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': FIXABLE_CODE,
        'b.ts': BAD_CODE
    }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS, [], true);
        t.is(okay, true);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, FIXABLE_CODE_FIXED);
    }));
}));
ava_1.default.serial('lint should not lint files listed in exclude', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ exclude: ['b.*'] }),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, true);
    }));
});
ava_1.default.serial('lint should lint globs listed in include', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ include: ['dirb/*'] }),
        dira: { 'a.ts': GOOD_CODE },
        dirb: { 'b.ts': BAD_CODE }
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.is(okay, false);
    }));
});
ava_1.default.serial('lint should lint only specified files', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({}),
        dira: { 'a.ts': GOOD_CODE },
        dirb: { 'b.ts': BAD_CODE }
    }, () => __awaiter(this, void 0, void 0, function* () {
        const aOkay = lint.lint(OPTIONS, ['dira/a.ts']);
        t.is(aOkay, true);
        const bOkay = lint.lint(OPTIONS, ['dirb/b.ts']);
        t.is(bOkay, false);
    }));
});
ava_1.default.serial('lint should throw for unrecognized files', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({}),
        'a.ts': GOOD_CODE,
    }, () => __awaiter(this, void 0, void 0, function* () {
        t.throws(() => {
            lint.lint(OPTIONS, ['z.ts']);
        });
    }));
});
ava_1.default.serial('lint should prefer user config file over default', (t) => __awaiter(this, void 0, void 0, function* () {
    const CUSTOM_LINT_CODE = 'debugger;';
    // By defualt the above should fail lint.
    yield fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': CUSTOM_LINT_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.false(okay);
    }));
    // User should be able to override the default config.
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'tslint.json': JSON.stringify({}),
        'a.ts': CUSTOM_LINT_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(OPTIONS);
        t.true(okay);
    }));
}));
ava_1.default.serial('lint for specific files should use file-specific config', t => {
    const CODE_WITH_PARSEINT = 'parseInt(42);';
    let logBuffer = '';
    const optionsWithLog = Object.assign({}, OPTIONS, {
        logger: {
            log: (...args) => {
                logBuffer += (args.join(' '));
            },
            error: util_1.nop,
            dir: util_1.nop
        }
    });
    return fixtures_1.withFixtures({
        dira: {
            'a.ts': CODE_WITH_PARSEINT,
        },
        dirb: { 'b.ts': CODE_WITH_PARSEINT, 'tslint.json': JSON.stringify({}) }
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = lint.lint(optionsWithLog, ['dira/a.ts', 'dirb/b.ts']);
        t.false(okay);
        t.regex(logBuffer, /dira\/a\.ts/);
        t.notRegex(logBuffer, /dirb\/b\.ts/);
    }));
});
// TODO: test for when tsconfig.json is missing.
//# sourceMappingURL=test-lint.js.map