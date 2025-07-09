import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as fse from 'fs-extra';
import glob from 'glob';
import * as path from 'path';
import * as T from 'fp-ts/lib/Task';
import { getConfig } from './config';
import { debug as debugImpl } from './utils';

const CFG = getConfig();

const {
  DEBUG,
  ROOT_PATH,
  CUSTOM_FOLDER,
  TRANSLATIONS_FOLDER,
  OUTPUT_PATH,
  TRANSLATIONS_PATH,
} = CFG;

function debug(...args: any[]) {
  debugImpl(DEBUG, args)
}

type Task<A> = T.Task<A>;
const task = T.task;

type Option<A> = O.Option<A>;

export function cleanOutputFolderNotSafe(): Task<void> {
  return () => {
    debug(`clean folder ${OUTPUT_PATH}`);
    return fse.remove(OUTPUT_PATH)
    .catch((error) => {
      debug(`removing folder failed ${OUTPUT_PATH}`);
      throw error;
    });
  };
}

export function getTranslationFilesNotSafe(): Task<string[]> {
  return () => {
    const transationFilesPattern = path.join(ROOT_PATH, TRANSLATIONS_FOLDER, '**/*.json');
    debug(`getting translation files paths ${transationFilesPattern}`);
    return new Promise<string[]>((resolve) => {
      glob(transationFilesPattern, (err, matches) => {
        if (!err) {
          resolve(matches);
        } else {
          debug(`getting translation files failed from path ${transationFilesPattern}`);
          throw err;
        }
      });
    });
  };
}

function readFileNotSafe(filePath: string): Task<string> {
  return () => {
    debug(`reading file ${filePath}`);
    return fse.readFile(filePath, {encoding: 'utf8'})
    .catch((error) => {
      console.error(`reading file failed ${filePath}`);
      console.error(error);
      process.exit(1);
    });
  };
}

function saveFileNotSafe(file: string, filePath: string): Task<void> {
  return () => {
    debug(`saving file ${filePath}`);
    return fse.ensureFile(filePath)
    .then(() => fse.writeFile(filePath, file))
    .catch((error) => {
      console.error(`saving file failed ${filePath}`);
      console.error(error);
      process.exit(1);
    });
  }
}

function readOptionalFile(filePath: string): Task<Option<string>> {
  return () => {
    debug(`reading optional file ${filePath}`);
    return fse.readFile(filePath, {encoding: 'utf8'})
    .then(O.some)
    .catch((_) => O.none as O.Option<string>);
  };
}

type JsonData = { [key: string]: any };

function isJsonData(value: unknown): value is JsonData {
  if (typeof value == 'object' && value !== null) {
    return Object.values(value)
      .every((v) => typeof v == 'string');
  }
  return false;
}

function parseJsonDataNotSafe(jsonFile: string): JsonData {
  try {
    const data: unknown = JSON.parse(jsonFile);
    if (isJsonData(data)) {
      return data;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error(`parsing JSON failed`);
    console.error(jsonFile);
    console.error(error);
    process.exit(1);
  }
}

function getCustomData(customFilePath: string) {
  return pipe(
    readOptionalFile(customFilePath),
    T.map(O.map(parseJsonDataNotSafe))
  );
}

function mergeJsonData(
  customData: JsonData,
  originalData: JsonData,
): JsonData {
  // TODO detect missing keys in orignial data
  const mergedData: JsonData = Object.assign({}, originalData, customData);

  debug(`mergeJsonData:`, { originalData, customData, mergedData });

  return mergedData;
}

function onCustomFolder(customFolder: string, originalData: JsonData, filePathRelative: string) {
  const customFilePath = path.join(
    ROOT_PATH,
    customFolder,
    TRANSLATIONS_FOLDER,
    filePathRelative
  );
  const noCustomFile = () => {
    debug(`custom file not found on ${customFilePath}`);
    return originalData;
  };

  return pipe(
    getCustomData(customFilePath),
    T.map(
      O.fold(
        noCustomFile,
        (customData) => mergeJsonData(customData, originalData),
      ),
    ),
  );
}

function readCustomAndParse(
  originalFile: string,
  customFolderO: Option<string>,
  filePathRelative: string,
) {
  const originalData: JsonData = parseJsonDataNotSafe(originalFile);
  const noCustomFolder = () => task.of(O.some(originalData));

  return pipe(
    customFolderO,
    O.fold(
      noCustomFolder,
      (customFolder) => onCustomFolder(customFolder, originalData, filePathRelative),
    ),
  );
}

function saveData(data: JsonData, outputFilePath: string) {
  // FIXME stringify may fail, but should not at this point
  return saveFileNotSafe(JSON.stringify(data), outputFilePath);
}

function processFile(filePath: string, customFolderO: Option<string>) {
  const filePathRelative = path.relative(TRANSLATIONS_PATH, filePath);
  const outputFilePath = path.join(OUTPUT_PATH, filePathRelative);

  return pipe(
    readFileNotSafe(filePath),
    T.chain((originalFile) => {
      return readCustomAndParse(
        originalFile,
        customFolderO,
        filePathRelative
      );
    }),
    T.chain((data) => saveData(data, outputFilePath)),
  );
}

function processFilesAll(files: string[]) {
  const customPath = CUSTOM_FOLDER.length != 0
    ? O.some(CUSTOM_FOLDER)
    : O.none;

  return A.array.sequence(T.task)(
    A.array.map(files, (file) => processFile(file, customPath)),
  );
}

const main = pipe(
  cleanOutputFolderNotSafe(),
  T.chain(getTranslationFilesNotSafe),
  T.chain(processFilesAll),
);

export default main;

// 5. handle errors in functional way, also reading and cleaning and parsing may fail
