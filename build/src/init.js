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
const chalk_1 = __importDefault(require("chalk"));
const cp = __importStar(require("child_process"));
const inquirer = __importStar(require("inquirer"));
const path = __importStar(require("path"));
const util_1 = require("./util");
const pkg = require('../../package.json');
const DEFUALT_PACKAGE_JSON = {
    name: '',
    version: '0.0.0',
    description: '',
    main: 'build/src/index.js',
    types: 'build/src/index.d.ts',
    files: ['build/src'],
    license: 'Apache-2.0',
    keywords: [],
    scripts: { test: 'echo "Error: no test specified" && exit 1' }
};
function query(message, question, defaultVal, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.yes) {
            return true;
        }
        else if (options.no) {
            return false;
        }
        if (message) {
            options.logger.log(message);
        }
        const answers = yield inquirer.prompt({ type: 'confirm', name: 'query', message: question, default: defaultVal });
        return answers.query;
    });
}
function addScripts(packageJson, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let edits = false;
        const scripts = {
            check: `gts check`,
            clean: 'gts clean',
            compile: `tsc -p .`,
            fix: `gts fix`,
            prepare: `npm run compile`,
            pretest: `npm run compile`,
            posttest: `npm run check`
        };
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        for (const script of Object.keys(scripts)) {
            let install = true;
            const existing = packageJson.scripts[script];
            const target = scripts[script];
            if (existing !== target) {
                if (existing) {
                    const message = `package.json already has a script for ${chalk_1.default.bold(script)}:\n` +
                        `-${chalk_1.default.red(existing)}\n+${chalk_1.default.green(target)}`;
                    install = yield query(message, 'Replace', false, options);
                }
                if (install) {
                    packageJson.scripts[script] = scripts[script];
                    edits = true;
                }
            }
        }
        return edits;
    });
}
exports.addScripts = addScripts;
function addDependencies(packageJson, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let edits = false;
        const deps = { 'gts': `^${pkg.version}`, 'typescript': '~2.8.0' };
        if (!packageJson.devDependencies) {
            packageJson.devDependencies = {};
        }
        for (const dep of Object.keys(deps)) {
            let install = true;
            const existing = packageJson.devDependencies[dep];
            const target = deps[dep];
            if (existing !== target) {
                if (existing) {
                    const message = `Already have devDependency for ${chalk_1.default.bold(dep)}:\n` +
                        `-${chalk_1.default.red(existing)}\n+${chalk_1.default.green(target)}`;
                    install = yield query(message, 'Overwrite', false, options);
                }
                if (install) {
                    packageJson.devDependencies[dep] = deps[dep];
                    edits = true;
                }
            }
        }
        return edits;
    });
}
exports.addDependencies = addDependencies;
function formatJson(object) {
    // TODO: preserve the indent from the input file.
    const json = JSON.stringify(object, null, '  ');
    return `${json}\n`;
}
function writePackageJson(packageJson, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options.logger.log('Writing package.json...');
        if (!options.dryRun) {
            yield util_1.writeFileAtomicp('./package.json', formatJson(packageJson));
        }
        const preview = {
            scripts: packageJson.scripts,
            devDependencies: packageJson.devDependencies
        };
        options.logger.dir(preview);
    });
}
function generateTsLintConfig(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = formatJson({ extends: 'gts/tslint.json' });
        return generateConfigFile(options, './tslint.json', config);
    });
}
function generateTsConfig(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = formatJson({
            extends: './node_modules/gts/tsconfig-google.json',
            compilerOptions: { rootDir: '.', outDir: 'build' },
            include: ['src/*.ts', 'src/**/*.ts', 'test/*.ts', 'test/**/*.ts']
        });
        return generateConfigFile(options, './tsconfig.json', config);
    });
}
function generateClangFormat(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const style = yield util_1.readFilep(path.join(__dirname, '../../.clang-format'), 'utf8');
        return generateConfigFile(options, './.clang-format', style);
    });
}
function generateConfigFile(options, filename, contents) {
    return __awaiter(this, void 0, void 0, function* () {
        let existing;
        try {
            existing = yield util_1.readFilep(filename, 'utf8');
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                /* not found, create it. */
            }
            else {
                throw new Error(`Unknown error reading ${filename}: ${err.message}`);
            }
        }
        let writeFile = true;
        if (existing && existing === contents) {
            options.logger.log(`No edits needed in ${filename}`);
            return;
        }
        else if (existing) {
            writeFile = yield query(`${chalk_1.default.bold(filename)} already exists`, 'Overwrite', false, options);
        }
        if (writeFile) {
            options.logger.log(`Writing ${filename}...`);
            if (!options.dryRun) {
                yield util_1.writeFileAtomicp(filename, contents);
            }
            options.logger.log(contents);
        }
    });
}
function init(options) {
    return __awaiter(this, void 0, void 0, function* () {
        let generatedPackageJson = false;
        let packageJson;
        try {
            packageJson = yield util_1.readJsonp('./package.json');
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                throw new Error(`Unable to open package.json file: ${err.message}`);
            }
            const generate = yield query(`${chalk_1.default.bold('package.json')} does not exist.`, `Generate`, true, options);
            if (!generate) {
                options.logger.log('Please run from a directory with your package.json.');
                return false;
            }
            packageJson = DEFUALT_PACKAGE_JSON;
            generatedPackageJson = true;
        }
        const addedDeps = yield addDependencies(packageJson, options);
        const addedScripts = yield addScripts(packageJson, options);
        if (generatedPackageJson || addedDeps || addedScripts) {
            yield writePackageJson(packageJson, options);
        }
        else {
            options.logger.log('No edits needed in package.json.');
        }
        yield generateTsConfig(options);
        yield generateTsLintConfig(options);
        yield generateClangFormat(options);
        // Run `npm install` after initial setup so `npm run check` works right away.
        if (!options.dryRun) {
            // --ignore-scripts so that compilation doesn't happen because there's no
            // source files yet.
            cp.spawnSync('npm', ['install', '--ignore-scripts'], { stdio: 'inherit' });
        }
        return true;
    });
}
exports.init = init;
//# sourceMappingURL=init.js.map