import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as path from 'path';

import { getConfig } from './config';
import { debug as debugImpl } from './debug';
import { JsonData } from './json-data';
import {
  cleanOutputFolderNotSafe,
  getTranslationFilesNotSafe,
  parseJsonDataNotSafe,
  readFileNotSafe,
  readOptionalFileNotSafe,
  saveFileNotSafe,
} from './not-safe';

const CFG = getConfig();

const {
  DEBUG,
  ROOT_PATH,
  CUSTOM_FOLDER,
  TRANSLATIONS_FOLDER,
  OUTPUT_FOLDER,
} = CFG;

const debug = debugImpl.bind(null, DEBUG);

export function getCustomData(customFilePath: string): T.Task<O.Option<JsonData>> {
  return pipe(
    readOptionalFileNotSafe(customFilePath),
    T.map(O.map(parseJsonDataNotSafe))
  );
}

export function mergeJsonData(
  customData: JsonData,
  originalData: JsonData,
): JsonData {
  // TODO detect missing keys in original data
  const mergedData: JsonData = Object.assign({}, originalData, customData);

  debug(`mergeJsonData:`, { originalData, customData, mergedData });

  return mergedData;
}

export function onCustomFolder(
  customFolder: string,
  originalData: JsonData,
  filePathRelative: string,
): T.Task<JsonData> {
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
  customFolderO: O.Option<string>,
  filePathRelative: string,
): T.Task<JsonData> {
  const originalData: JsonData = parseJsonDataNotSafe(originalFile);
  const noCustomFolder = () => T.task.of(O.some(originalData));

  return pipe(
    customFolderO,
    O.fold(
      noCustomFolder,
      (customFolder) => onCustomFolder(customFolder, originalData, filePathRelative),
    ),
  );
}

function processFile(filePath: string, customFolderO: O.Option<string>): T.Task<void> {
  const filePathRelative = path.relative(TRANSLATIONS_FOLDER, filePath);
  const outputFilePath = path.join(OUTPUT_FOLDER, filePathRelative);

  return pipe(
    readFileNotSafe(filePath),
    T.chain((originalFile) => {
      return readCustomAndParse(
        originalFile,
        customFolderO,
        filePathRelative
      );
    }),
    // FIXME stringify may fail, but should not at this point
    T.chain((data) => saveFileNotSafe(JSON.stringify(data), outputFilePath)),
  );
}

function processFilesAll(files: string[]): T.Task<void[]> {
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
