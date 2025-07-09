"use strict";
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
const A = __importStar(require("fp-ts/lib/Array"));
const O = __importStar(require("fp-ts/lib/Option"));
const pipeable_1 = require("fp-ts/lib/pipeable");
const fse = __importStar(require("fs-extra"));
const glob_1 = __importDefault(require("glob"));
const path = __importStar(require("path"));
const T = __importStar(require("fp-ts/lib/Task"));
const config_1 = __importDefault(require("./config"));
const CFG = config_1.default();
const { DEBUG, ROOT_PATH, CUSTOM_FOLDER, TRANSLATIONS_FOLDER, OUTPUT_PATH, TRANSLATIONS_PATH, } = CFG;
const task = T.task;
// treat logging as no side effect
function debug(...args) {
    DEBUG && console.log(...args);
}
exports.debug = debug;
function cleanOutputFolderNotSafe() {
    return () => {
        debug(`clean folder ${OUTPUT_PATH}`);
        return fse.remove(OUTPUT_PATH)
            .catch((error) => {
            console.error(`removing folder failed ${OUTPUT_PATH}`);
            console.error(error);
            process.exit(1);
        });
    };
}
function getTranslationFilesNotSafe() {
    return () => {
        const transationFilesPattern = path.join(ROOT_PATH, TRANSLATIONS_FOLDER, '**/*.json');
        debug(`getting translation files paths ${transationFilesPattern}`);
        return new Promise((resolve) => {
            glob_1.default(transationFilesPattern, (err, matches) => {
                if (!err) {
                    resolve(matches);
                }
                else {
                    console.error(`getting translation files failed from path ${transationFilesPattern}`);
                    console.error(err);
                    process.exit(1);
                }
            });
        });
    };
}
function readFileNotSafe(filePath) {
    return () => {
        debug(`reading file ${filePath}`);
        return fse.readFile(filePath, { encoding: 'utf8' })
            .catch((error) => {
            console.error(`reading file failed ${filePath}`);
            console.error(error);
            process.exit(1);
        });
    };
}
function saveFileNotSafe(file, filePath) {
    return () => {
        debug(`saving file ${filePath}`);
        return fse.ensureFile(filePath)
            .then(() => fse.writeFile(filePath, file))
            .catch((error) => {
            console.error(`saving file failed ${filePath}`);
            console.error(error);
            process.exit(1);
        });
    };
}
function readOptionalFile(filePath) {
    return () => {
        debug(`reading optional file ${filePath}`);
        return fse.readFile(filePath, { encoding: 'utf8' })
            .then(O.some)
            .catch((_) => O.none);
    };
}
function isJsonData(value) {
    if (typeof value == 'object' && value !== null) {
        return Object.values(value)
            .every((v) => typeof v == 'string');
    }
    return false;
}
function parseJsonDataNotSafe(jsonFile) {
    try {
        const data = JSON.parse(jsonFile);
        if (isJsonData(data)) {
            return data;
        }
        else {
            throw new Error('Invalid data format');
        }
    }
    catch (error) {
        console.error(`parsing JSON failed`);
        console.error(jsonFile);
        console.error(error);
        process.exit(1);
    }
}
function getCustomData(customFilePath) {
    return pipeable_1.pipe(readOptionalFile(customFilePath), T.map(O.map(parseJsonDataNotSafe)));
}
function mergeJsonData(customData, originalData) {
    // TODO detect missing keys in orignial data
    const mergedData = Object.assign({}, originalData, customData);
    debug(`mergeJsonData:`, { originalData, customData, mergedData });
    return mergedData;
}
function onCustomFolder(customFolder, originalData, filePathRelative) {
    const customFilePath = path.join(ROOT_PATH, customFolder, TRANSLATIONS_FOLDER, filePathRelative);
    const noCustomFile = () => {
        debug(`custom file not found on ${customFilePath}`);
        return originalData;
    };
    return pipeable_1.pipe(getCustomData(customFilePath), T.map(O.fold(noCustomFile, (customData) => mergeJsonData(customData, originalData))));
}
function readCustomAndParse(originalFile, customFolderO, filePathRelative) {
    const originalData = parseJsonDataNotSafe(originalFile);
    const noCustomFolder = () => task.of(O.some(originalData));
    return pipeable_1.pipe(customFolderO, O.fold(noCustomFolder, (customFolder) => onCustomFolder(customFolder, originalData, filePathRelative)));
}
function saveData(data, outputFilePath) {
    // FIXME stringify may fail, but should not at this point
    return saveFileNotSafe(JSON.stringify(data), outputFilePath);
}
function processFile(filePath, customFolderO) {
    const filePathRelative = path.relative(TRANSLATIONS_PATH, filePath);
    const outputFilePath = path.join(OUTPUT_PATH, filePathRelative);
    return pipeable_1.pipe(readFileNotSafe(filePath), T.chain((originalFile) => {
        return readCustomAndParse(originalFile, customFolderO, filePathRelative);
    }), T.chain((data) => saveData(data, outputFilePath)));
}
function processFilesAll(files) {
    const customPath = CUSTOM_FOLDER.length != 0
        ? O.some(CUSTOM_FOLDER)
        : O.none;
    return A.array.sequence(T.task)(A.array.map(files, (file) => processFile(file, customPath)));
}
const main = pipeable_1.pipe(cleanOutputFolderNotSafe(), T.chain(getTranslationFilesNotSafe), T.chain(processFilesAll));
exports.default = main;
// 5. handle errors in functional way, also reading and cleaning and parsing may fail
