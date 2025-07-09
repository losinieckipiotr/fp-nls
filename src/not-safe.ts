import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';
import * as fse from 'fs-extra';
import glob from 'glob';
import * as path from 'path';

import { getConfig } from './config';
import { debug as debugImpl } from './debug';
import { isJsonData, JsonData } from './json-data';

const CFG = getConfig();

const {
  DEBUG,
  ROOT_PATH,
  TRANSLATIONS_FOLDER,
  OUTPUT_FOLDER,
} = CFG;

const debug = debugImpl.bind(null, DEBUG);

export function cleanOutputFolderNotSafe(): T.Task<void> {
  return () => {
    debug(`clean folder ${OUTPUT_FOLDER}`);
    return fse.remove(OUTPUT_FOLDER)
      .catch((error) => {
        debug(`removing folder '${OUTPUT_FOLDER}' failed`);
        throw error;
      });
  };
}

export function getTranslationFilesNotSafe(): T.Task<string[]> {
  return () => {
    const translationFilesPattern = path.join(ROOT_PATH, TRANSLATIONS_FOLDER, '**/*.json');
    debug(`getting translation files paths ${translationFilesPattern}`);
    return new Promise<string[]>((resolve) => {
      glob(translationFilesPattern, (error, matches) => {
        if (!error) {
          resolve(matches);
        } else {
          debug(`getting translation files failed from path '${translationFilesPattern}'`);
          throw error;
        }
      });
    });
  };
}

export function readFileNotSafe(filePath: string): T.Task<string> {
  return () => {
    debug(`reading file ${filePath}`);
    return fse.readFile(filePath, {encoding: 'utf8'})
      .catch((error) => {
        debug(`reading file '${filePath}' failed`);
        throw error;
      });
  };
}

export function saveFileNotSafe(file: string, filePath: string): T.Task<void> {
  return () => {
    debug(`saving file ${filePath}`);
    return fse.ensureFile(filePath)
      .then(() => fse.writeFile(filePath, file))
      .catch((error) => {
        debug(`saving file '${filePath}' failed`);
        throw error;
      });
  }
}

export function readOptionalFileNotSafe(filePath: string): T.Task<O.Option<string>> {
  return () => {
    debug(`reading optional file ${filePath}`);
    return fse.pathExists(filePath)
      .then((exists) => {
        if (exists) {
          return fse.readFile(filePath, {encoding: 'utf8'})
          .then(O.some);
        } else {
          return O.none as O.Option<string>;
        }
      }).catch((error) => {
        debug(`reading optional file '${filePath}' failed`);
        throw error;
      })
  };
}

export function parseJsonDataNotSafe(jsonFile: string): JsonData {
  try {
    const data: unknown = JSON.parse(jsonFile);
    if (isJsonData(data)) {
      return data;
    } else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    debug('parsing JSON failed', error, jsonFile);
    throw error;
  }
}
