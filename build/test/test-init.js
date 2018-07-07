"use strict";
/**
 * Copyright 2018 Google LLC.
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
const path_1 = __importDefault(require("path"));
const init = __importStar(require("../src/init"));
const util_1 = require("../src/util");
const fixtures_1 = require("./fixtures");
const OPTIONS = {
    gtsRootDir: path_1.default.resolve(__dirname, '../..'),
    targetRootDir: './',
    dryRun: false,
    yes: false,
    no: false,
    logger: { log: util_1.nop, error: util_1.nop, dir: util_1.nop }
};
const OPTIONS_YES = Object.assign({}, OPTIONS, { yes: true });
const OPTIONS_NO = Object.assign({}, OPTIONS, { no: true });
const OPTIONS_DRY_RUN = Object.assign({}, OPTIONS, { dryRun: true });
function hasExpectedScripts(packageJson) {
    return !!packageJson.scripts && [
        'check', 'clean', 'compile', 'fix', 'prepare', 'pretest', 'posttest'
    ].every(s => !!packageJson.scripts[s]);
}
function hasExpectedDependencies(packageJson) {
    return !!packageJson.devDependencies &&
        ['gts', 'typescript'].every(d => !!packageJson.devDependencies[d]);
}
ava_1.default('addScripts should add a scripts section if none exists', (t) => __awaiter(this, void 0, void 0, function* () {
    const pkg = {};
    const result = yield init.addScripts(pkg, OPTIONS);
    t.is(result, true); // made edits.
    t.truthy(pkg.scripts);
    t.truthy(hasExpectedScripts(pkg));
}));
ava_1.default('addScripts should not edit existing scripts on no', (t) => __awaiter(this, void 0, void 0, function* () {
    const SCRIPTS = {
        check: `fake check`,
        clean: 'fake clean',
        compile: `fake tsc -p .`,
        fix: `fake fix`,
        prepare: `fake run compile`,
        pretest: `fake run compile`,
        posttest: `fake run check`
    };
    const pkg = { scripts: Object.assign({}, SCRIPTS) };
    const result = yield init.addScripts(pkg, OPTIONS_NO);
    t.is(result, false); // no edits.
    t.deepEqual(pkg.scripts, SCRIPTS);
}));
ava_1.default('addScripts should edit existing scripts on yes', (t) => __awaiter(this, void 0, void 0, function* () {
    const SCRIPTS = {
        check: `fake check`,
        clean: 'fake clean',
        compile: `fake tsc -p .`,
        fix: `fake fix`,
        prepare: `fake run compile`,
        pretest: `fake run compile`,
        posttest: `fake run check`
    };
    const pkg = { scripts: Object.assign({}, SCRIPTS) };
    const result = yield init.addScripts(pkg, OPTIONS_YES);
    t.is(result, true); // made edits.
    t.notDeepEqual(pkg.scripts, SCRIPTS);
}));
ava_1.default('addDependencies should add a deps section if none exists', (t) => __awaiter(this, void 0, void 0, function* () {
    const pkg = {};
    const result = yield init.addDependencies(pkg, OPTIONS);
    t.is(result, true); // made edits.
    t.truthy(pkg.devDependencies);
}));
ava_1.default('addDependencies should not edit existing deps on no', (t) => __awaiter(this, void 0, void 0, function* () {
    const DEPS = { gts: 'something', typescript: 'or the other' };
    const pkg = { devDependencies: Object.assign({}, DEPS) };
    const OPTIONS_NO = Object.assign({}, OPTIONS, { no: true });
    const result = yield init.addDependencies(pkg, OPTIONS_NO);
    t.is(result, false); // no edits.
    t.deepEqual(pkg.devDependencies, DEPS);
}));
ava_1.default('addDependencies should edit existing deps on yes', (t) => __awaiter(this, void 0, void 0, function* () {
    const DEPS = { gts: 'something', typescript: 'or the other' };
    const pkg = { devDependencies: Object.assign({}, DEPS) };
    const result = yield init.addDependencies(pkg, OPTIONS_YES);
    t.is(result, true); // made edits.
    t.notDeepEqual(pkg.devDependencies, DEPS);
}));
// TODO: test generateConfigFile
// init
ava_1.default.serial('init should read local package.json', t => {
    const originalContents = { some: 'property' };
    return fixtures_1.withFixtures({ 'package.json': JSON.stringify(originalContents) }, () => __awaiter(this, void 0, void 0, function* () {
        // TODO: this test causes `npm install` to run in the fixture directory.
        // This may make it sensistive to the network, npm resiliency. Find a
        // way to mock npm.
        const result = yield init.init(OPTIONS_YES);
        t.truthy(result);
        const contents = yield util_1.readJsonp('./package.json');
        t.not(contents, originalContents, 'the file should have been modified');
        t.is(contents.some, originalContents.some, 'unrelated property should have preserved');
    }));
});
ava_1.default.serial('init should handle missing package.json', t => {
    return fixtures_1.withFixtures({}, () => __awaiter(this, void 0, void 0, function* () {
        // TODO: this test causes `npm install` to run in the fixture directory.
        // This may make it sensistive to the network, npm resiliency. Find a way to
        // mock npm.
        const result = yield init.init(OPTIONS_YES);
        t.truthy(result);
        const contents = yield util_1.readJsonp('./package.json');
        t.truthy(hasExpectedScripts(contents));
        t.truthy(hasExpectedDependencies(contents));
    }));
});
// TODO: need more tests.
//# sourceMappingURL=test-init.js.map