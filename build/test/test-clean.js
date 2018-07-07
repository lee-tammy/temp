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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const clean_1 = require("../src/clean");
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
ava_1.default.failing.serial('should gracefully error if tsconfig is missing', t => {
    return fixtures_1.withFixtures({}, () => __awaiter(this, void 0, void 0, function* () {
        yield clean_1.clean(OPTIONS);
    }));
});
ava_1.default.serial('should gracefully error if tsconfig does not have valid outDir', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({}) }, () => __awaiter(this, void 0, void 0, function* () {
        const deleted = yield clean_1.clean(OPTIONS);
        t.is(deleted, false);
    }));
});
ava_1.default.serial('should avoid deleting .', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ compilerOptions: { outDir: '.' } }) }, () => __awaiter(this, void 0, void 0, function* () {
        const deleted = yield clean_1.clean(OPTIONS);
        t.is(deleted, false);
    }));
});
ava_1.default.failing.serial('should ensure that outDir is local to targetRoot', t => {
    return fixtures_1.withFixtures({ 'tsconfig.json': JSON.stringify({ compilerOptions: { outDir: '../out' } }) }, () => __awaiter(this, void 0, void 0, function* () {
        const deleted = yield clean_1.clean(OPTIONS);
        t.is(deleted, false);
    }));
});
ava_1.default.serial('should remove outDir', t => {
    const OUT = 'outputDirectory';
    return fixtures_1.withFixtures({
        'tsconfig.json': JSON.stringify({ compilerOptions: { outDir: OUT } }),
        [OUT]: {}
    }, (dir) => __awaiter(this, void 0, void 0, function* () {
        const outputPath = path.join(dir, OUT);
        // make sure the output directory exists.
        fs.accessSync(outputPath);
        const deleted = yield clean_1.clean(OPTIONS);
        t.is(deleted, true);
        // make sure the directory has been deleted.
        t.throws(() => {
            fs.accessSync(outputPath);
        });
    }));
});
//# sourceMappingURL=test-clean.js.map