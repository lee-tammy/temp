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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const make_dir_1 = __importDefault(require("make-dir"));
const path = __importStar(require("path"));
const pify_1 = __importDefault(require("pify"));
const tmp = __importStar(require("tmp"));
const writeFilep = pify_1.default(fs.writeFile);
function setupFixtures(dir, fixtures) {
    return __awaiter(this, void 0, void 0, function* () {
        yield make_dir_1.default(dir);
        const keys = Object.keys(fixtures);
        for (const key of keys) {
            const filePath = path.join(dir, key);
            if (typeof fixtures[key] === 'string') {
                const contents = fixtures[key];
                yield writeFilep(filePath, contents);
            }
            else {
                const fixture = fixtures[key];
                yield setupFixtures(filePath, fixture);
            }
        }
    });
}
function withFixtures(fixtures, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        const keep = !!process.env.GTS_KEEP_TEMPDIRS;
        const dir = tmp.dirSync({ keep, unsafeCleanup: true });
        yield setupFixtures(dir.name, fixtures);
        const origDir = process.cwd();
        process.chdir(dir.name);
        const result = yield fn(dir.name);
        process.chdir(origDir);
        if (!keep) {
            dir.removeCallback();
        }
        return result;
    });
}
exports.withFixtures = withFixtures;
//# sourceMappingURL=fixtures.js.map