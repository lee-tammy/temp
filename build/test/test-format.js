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
const format = __importStar(require("../src/format"));
const util_1 = require("../src/util");
const fixtures_1 = require("./fixtures");
// clang-format won't pass this code because of trailing spaces.
const BAD_CODE = 'export const foo = [ 2 ];';
const GOOD_CODE = 'export const foo = [2];';
const OPTIONS = {
    gtsRootDir: path.resolve(__dirname, '../..'),
    targetRootDir: './',
    dryRun: false,
    yes: false,
    no: false,
    logger: { log: console.log, error: console.error, dir: util_1.nop }
};
ava_1.default.serial('format should return true for well-formatted files', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ files: ['a.ts'] }), 'a.ts': GOOD_CODE }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, [], false);
        t.true(result);
    }));
});
ava_1.default.serial('format should return false for ill-formatted files', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ files: ['a.ts'] }), 'a.ts': BAD_CODE }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, [], false);
        t.false(result);
    }));
});
ava_1.default.serial('format should only look in root files', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': 'import {foo} from \'./b\';\n',
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, [], false);
        t.true(result);
    }));
});
ava_1.default.serial('format should auto fix problems', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ files: ['a.ts'] }), 'a.ts': BAD_CODE }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, [], true);
        t.true(result);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, GOOD_CODE);
    }));
});
ava_1.default.serial('format should format files listed in tsconfig.files', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = yield format.format(OPTIONS);
        t.true(okay);
    }));
});
ava_1.default.serial('format should format *.ts files when no files or inlcude has been specified', (t) => __awaiter(this, void 0, void 0, function* () {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({}),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = yield format.format(OPTIONS);
        t.false(okay);
    }));
}));
ava_1.default.serial('format files listed in tsconfig.files when empty list is provided', (t) => __awaiter(this, void 0, void 0, function* () {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': BAD_CODE,
        'b.ts': BAD_CODE
    }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const okay = yield format.format(OPTIONS, [], true);
        t.is(okay, true);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, GOOD_CODE);
    }));
}));
ava_1.default.serial('skip files listed in exclude', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ exclude: ['b.*'] }),
        'a.ts': GOOD_CODE,
        'b.ts': BAD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = yield format.format(OPTIONS);
        t.is(okay, true);
    }));
});
ava_1.default.serial('format globs listed in include', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ include: ['dirb/*'] }),
        dira: { 'a.ts': GOOD_CODE },
        dirb: { 'b.ts': BAD_CODE }
    }, () => __awaiter(this, void 0, void 0, function* () {
        const okay = yield format.format(OPTIONS);
        t.is(okay, false);
    }));
});
ava_1.default.serial('format should not auto fix on dry-run', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ files: ['a.ts'] }), 'a.ts': BAD_CODE }, (fixturesDir) => __awaiter(this, void 0, void 0, function* () {
        const optionsWithDryRun = Object.assign({}, OPTIONS, { dryRun: true });
        const okay = yield format.format(optionsWithDryRun, [], true);
        t.is(okay, false);
        const contents = fs_1.default.readFileSync(path.join(fixturesDir, 'a.ts'), 'utf8');
        t.deepEqual(contents, BAD_CODE);
    }));
});
ava_1.default.serial('format should use user provided config', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        '.clang-format': 'Language: JavaScript',
        'a.ts': BAD_CODE // but actually good under the custom JS format config.
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, [], false);
        t.true(result);
    }));
});
ava_1.default.serial('format should prefer the files parameter over options', t => {
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ files: ['a.ts'] }),
        'a.ts': BAD_CODE,
        'good.ts': GOOD_CODE
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield format.format(OPTIONS, ['good.ts'], false);
        t.true(result);
    }));
});
ava_1.default.serial('format should return error from failed spawn', (t) => __awaiter(this, void 0, void 0, function* () {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ files: ['a.ts'] }), 'a.ts': GOOD_CODE }, () => __awaiter(this, void 0, void 0, function* () {
        const MESSAGE = '🦄';
        // Mock clangFormat.
        const original = format.clangFormat.spawnClangFormat;
        // tslint:disable-next-line:no-any
        format.clangFormat.spawnClangFormat = (_, cb) => {
            setImmediate(() => {
                cb(new Error(MESSAGE));
            });
        };
        yield t.throws(format.format(OPTIONS, [], true), Error, MESSAGE);
        yield t.throws(format.format(OPTIONS, [], false), Error, MESSAGE);
        format.clangFormat.spawnClangFormat = original;
    }));
}));
//# sourceMappingURL=test-format.js.map