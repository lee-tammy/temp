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
const path = __importStar(require("path"));
const pify_1 = __importDefault(require("pify"));
const rimraf_1 = __importDefault(require("rimraf"));
exports.readFilep = pify_1.default(fs.readFile);
exports.rimrafp = pify_1.default(rimraf_1.default);
exports.writeFileAtomicp = pify_1.default(require('write-file-atomic'));
function readJsonp(jsonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.parse(yield exports.readFilep(jsonPath));
    });
}
exports.readJsonp = readJsonp;
function nop() {
    /* empty */
}
exports.nop = nop;
/**
 * Find the tsconfig.json, read it, and return parsed contents.
 * @param rootDir Directory where the tsconfig.json should be found.
 */
function getTSConfig(rootDir, customReadFilep) {
    return __awaiter(this, void 0, void 0, function* () {
        const tsconfigPath = path.join(rootDir, 'tsconfig.json');
        customReadFilep = customReadFilep || exports.readFilep;
        const json = yield customReadFilep(tsconfigPath, 'utf8');
        const contents = JSON.parse(json);
        return contents;
    });
}
exports.getTSConfig = getTSConfig;
//# sourceMappingURL=util.js.map