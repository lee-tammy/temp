"use strict";
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
const chalk_1 = __importDefault(require("chalk"));
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const ncp = __importStar(require("ncp"));
const pify_1 = __importDefault(require("pify"));
const rimraf_1 = __importDefault(require("rimraf"));
const tmp = __importStar(require("tmp"));
const pkg = require('../../package.json');
const rimrafp = pify_1.default(rimraf_1.default);
const mkdirp = pify_1.default(fs.mkdir);
const simpleExecp = pify_1.default(cp.exec);
const renamep = pify_1.default(fs.rename);
const ncpp = pify_1.default(ncp.ncp);
function isExecError(err) {
    return err.code !== undefined;
}
// cp.exec doesn't fit the (err ^ result) pattern because a process can write
// to stdout/stderr and still exit with error code != 0.
// In most cases simply promisifying cp.exec is adequate, but it's not if we
// need to see console output for a process that exited with a non-zero exit
// code, so we define a more exhaustive promsified cp.exec here.
// TODO: replace this code with a npm modules that promisifies exec.
const execp = (command, execOptions) => {
    return new Promise((resolve) => {
        cp.exec(command, execOptions || {}, (err, stdout, stderr) => {
            resolve({
                exitCode: err && isExecError(err) ? err.code : 0,
                stdout,
                stderr
            });
        });
    });
};
const keep = !!process.env.GTS_KEEP_TEMPDIRS;
const stagingDir = tmp.dirSync({ keep, unsafeCleanup: true });
const stagingPath = stagingDir.name;
const execOpts = {
    cwd: `${stagingPath}/kitchen`
};
console.log(`${chalk_1.default.blue(`${__filename} staging area: ${stagingPath}`)}`);
/**
 * Create a staging directory with temp fixtures used
 * to test on a fresh application.
 */
ava_1.default.before(() => __awaiter(this, void 0, void 0, function* () {
    yield simpleExecp('npm pack');
    const tarball = `${pkg.name}-${pkg.version}.tgz`;
    yield renamep(tarball, `${stagingPath}/gts.tgz`);
    yield ncpp('test/fixtures', `${stagingPath}/`);
}));
ava_1.default.serial('init', (t) => __awaiter(this, void 0, void 0, function* () {
    const nodeVersion = Number(process.version.slice(1).split('.')[0]);
    if (nodeVersion < 8) {
        yield simpleExecp('npm install', execOpts);
        yield simpleExecp('./node_modules/.bin/gts init -y', execOpts);
    }
    else {
        // It's important to use `-n` here because we don't want to overwrite
        // the version of gts installed, as it will trigger the npm install.
        yield simpleExecp(`npx -p ${stagingPath}/gts.tgz --ignore-existing gts init -n`, execOpts);
    }
    // Ensure config files got generated.
    fs.accessSync(`${stagingPath}/kitchen/tsconfig.json`);
    fs.accessSync(`${stagingPath}/kitchen/tslint.json`);
    fs.accessSync(`${stagingPath}/kitchen/.clang-format`);
    // Compilation shouldn't have happened. Hence no `build` directory.
    const dirContents = fs.readdirSync(`${stagingPath}/kitchen`);
    t.is(dirContents.indexOf('build'), -1);
    t.pass();
}));
ava_1.default.serial('use as a non-locally installed module', (t) => __awaiter(this, void 0, void 0, function* () {
    // Use from a directory different from where we have locally installed. This
    // simulates use as a globally installed module.
    const GTS = `${stagingPath}/kitchen/node_modules/.bin/gts`;
    const tmpDir = tmp.dirSync({ keep, unsafeCleanup: true });
    const opts = { cwd: `${tmpDir.name}/kitchen` };
    // Copy test files.
    yield ncpp('test/fixtures', `${tmpDir.name}/`);
    // Test package.json expects a gts tarball from ../gts.tgz.
    yield ncpp(`${stagingPath}/gts.tgz`, `${tmpDir.name}/gts.tgz`);
    // It's important to use `-n` here because we don't want to overwrite
    // the version of gts installed, as it will trigger the npm install.
    yield simpleExecp(`${GTS} init -n`, opts);
    // The `extends` field must use the local gts path.
    const tsconfigJson = fs.readFileSync(`${tmpDir.name}/kitchen/tsconfig.json`, 'utf8');
    const tsconfig = JSON.parse(tsconfigJson);
    t.deepEqual(tsconfig.extends, './node_modules/gts/tsconfig-google.json');
    // server.ts has a lint error. Should error.
    yield t.throws(simpleExecp(`${GTS} check src/server.ts`, opts));
    if (!keep) {
        tmpDir.removeCallback();
    }
    t.pass();
}));
ava_1.default.serial('generated json files should terminate with newline', (t) => __awaiter(this, void 0, void 0, function* () {
    yield simpleExecp('./node_modules/.bin/gts init -y', execOpts);
    t.truthy(fs.readFileSync(`${stagingPath}/kitchen/package.json`, 'utf8')
        .endsWith('\n'));
    t.truthy(fs.readFileSync(`${stagingPath}/kitchen/tsconfig.json`, 'utf8')
        .endsWith('\n'));
    t.truthy(fs.readFileSync(`${stagingPath}/kitchen/tslint.json`, 'utf8')
        .endsWith('\n'));
}));
ava_1.default.serial('check before fix', (t) => __awaiter(this, void 0, void 0, function* () {
    const { exitCode, stdout } = yield execp('npm run check', execOpts);
    t.deepEqual(exitCode, 1);
    t.notDeepEqual(stdout.indexOf('clang-format reported errors'), -1);
    t.pass();
}));
ava_1.default.serial('fix', (t) => __awaiter(this, void 0, void 0, function* () {
    const preFix = fs.readFileSync(`${stagingPath}/kitchen/src/server.ts`, 'utf8')
        .split('\n');
    yield simpleExecp('npm run fix', execOpts);
    const postFix = fs.readFileSync(`${stagingPath}/kitchen/src/server.ts`, 'utf8')
        .split('\n');
    t.deepEqual(preFix[0].trim() + ';', postFix[0]); // fix should have added a semi-colon
    t.pass();
}));
ava_1.default.serial('check after fix', (t) => __awaiter(this, void 0, void 0, function* () {
    yield simpleExecp('npm run check', execOpts);
    t.pass();
}));
ava_1.default.serial('build', (t) => __awaiter(this, void 0, void 0, function* () {
    yield simpleExecp('npm run compile', execOpts);
    fs.accessSync(`${stagingPath}/kitchen/build/src/server.js`);
    fs.accessSync(`${stagingPath}/kitchen/build/src/server.js.map`);
    fs.accessSync(`${stagingPath}/kitchen/build/src/server.d.ts`);
    t.pass();
}));
/**
 * Verify the `gts clean` command actually removes the
 * output dir
 */
ava_1.default.serial('clean', (t) => __awaiter(this, void 0, void 0, function* () {
    yield simpleExecp('npm run clean', execOpts);
    t.throws(() => {
        fs.accessSync(`${stagingPath}/kitchen/build`);
    });
}));
/**
 * CLEAN UP - remove the staging directory when done.
 */
ava_1.default.after.always('cleanup staging', () => __awaiter(this, void 0, void 0, function* () {
    if (!keep) {
        stagingDir.removeCallback();
    }
}));
//# sourceMappingURL=test-kitchen.js.map