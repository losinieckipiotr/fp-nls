import * as O from 'fp-ts/lib/Option';
import * as fse from 'fs-extra';
import glob from 'glob';

import { testFilePath, testJsonContent, testJsonData, testOutFile, testError } from '../__mocks__/data';
import { debug } from '../src/debug';
import {
  cleanOutputFolderNotSafe,
  getTranslationFilesNotSafe,
  parseJsonDataNotSafe,
  readFileNotSafe,
  readOptionalFileNotSafe,
  saveFileNotSafe,
} from '../src/not-safe';
import { getConfig } from '../src/config';

jest.mock('../src/debug', () => {
	return {
		debug: jest.fn(() => {}),
	};
});
jest.mock('fs-extra');
jest.mock('glob');
jest.mock('fs-extra');

beforeEach(() => {
	const debugMock = debug as jest.Mock<void>;
	debugMock.mockClear();

	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;
	remove.mockClear();

	const globMock = glob as unknown as jest.Mock<void, [string, (err: Error | null, matches: string[]) => void]>;
	globMock.mockClear();

	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockClear();

	const ensureFile = fse.ensureFile as unknown as jest.Mock<Promise<void>, [string]>;
	ensureFile.mockClear();

	const writeFile = fse.writeFile as unknown as jest.Mock<Promise<void>, [string, string]>;
	writeFile.mockClear();

	const pathExists = fse.pathExists as unknown as jest.Mock<Promise<boolean>, [string]>;
	pathExists.mockClear();
});

test('cleanOutputFolderNotSafe', () => {
	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;
	remove.mockResolvedValue();

	const CFG = getConfig();

	expect.assertions(5);

	const task = cleanOutputFolderNotSafe();
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toBeUndefined()
		.then(() => {
			expect(debug).toBeCalledTimes(1);

			expect(remove).toBeCalledTimes(1);
			expect(remove).toHaveBeenCalledWith(CFG.OUTPUT_FOLDER);
		});
});

test('cleanOutputFolderNotSafe throws', () => {
	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;

	remove.mockRejectedValueOnce(testError);

	expect.assertions(2);

	const task = cleanOutputFolderNotSafe();

	return task()
		.catch((error) => {
			expect(error).toBe(testError);
			expect(debug).toHaveBeenCalledTimes(2);
		});
});

test('getTranslationFilesNotSafe', () => {
	// TO remove ?
	const testGlob = [
		'./nls/eng.json',
		'./nls/pl.json'
	];
	const transationFilesPattern = 'nls/**/*.json';

	const globMock = (glob as unknown) as jest.Mock<void, [string, (err: Error | null, matches: string[]) => void]>;
	globMock.mockImplementation((_, cb) => {
		cb(null, testGlob);
	});

	expect.assertions(5);

	const task = getTranslationFilesNotSafe();
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toBe(testGlob)
		.then(() => {
			expect(debug).toHaveBeenCalledTimes(1);

			expect(globMock).toHaveBeenCalledTimes(1);
			expect(globMock).toHaveBeenCalledWith(transationFilesPattern, expect.any(Function));
		});
});

test('getTranslationFilesNotSafe throws', () => {
	const testGlob: string[] = [];

	const globMock = (glob as unknown) as jest.Mock<void, [string, (err: Error | null, matches: string[]) => void]>;
	globMock.mockImplementation((_, cb) => {
		cb(testError, testGlob);
	});

	expect.assertions(3);

	const task = getTranslationFilesNotSafe();
	expect(typeof task).toBe('function');

	return expect(task()).rejects.toBe(testError)
		.then(() => {
			expect(debug).toHaveBeenCalledTimes(2);
		});
});

test('readFileNotSafe', () => {
	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockResolvedValue(testJsonContent);

	expect.assertions(5);

	const task = readFileNotSafe(testFilePath);
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toBe(testJsonContent)
		.then(() => {
			expect(debug).toHaveBeenCalledTimes(1);

			expect(readFile).toHaveBeenCalledTimes(1);
			expect(readFile).toHaveBeenCalledWith(testFilePath, {encoding: 'utf8'});
		});
});

test('readFileNotSafe throws', () => {
	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockRejectedValue(testError);

	expect.assertions(2);

	const task = readFileNotSafe(testFilePath);

	return expect(task()).rejects.toBe(testError)
		.then(() => {
			expect(debug).toHaveBeenCalledTimes(2);
		})
});



test('saveFileNotSafe', () => {
	const ensureFile = fse.ensureFile as unknown as jest.Mock<Promise<void>, [string]>;
	ensureFile.mockResolvedValue();

	const writeFile = fse.writeFile as unknown as jest.Mock<Promise<void>, [string, string]>;
	writeFile.mockResolvedValue();

	expect.assertions(7);

	const task = saveFileNotSafe(testOutFile, testFilePath);
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toBeUndefined()
		.then(() => {
			expect(debug).toBeCalledTimes(1);

			expect(ensureFile).toBeCalledTimes(1);
			expect(ensureFile).toHaveBeenCalledWith(testFilePath);

			expect(writeFile).toBeCalledTimes(1);
			expect(writeFile).toHaveBeenCalledWith(testFilePath, testOutFile);
		});
});

test('saveFileNotSafe throws', () => {
	const ensureFile = fse.ensureFile as unknown as jest.Mock<Promise<void>, [string]>;
	ensureFile.mockResolvedValue();

	const writeFile = fse.writeFile as unknown as jest.Mock<Promise<void>, [string, string]>;
	writeFile.mockRejectedValue(testError);

	expect.assertions(2);

	const task = saveFileNotSafe(testOutFile, testFilePath);

	return expect(task()).rejects.toBe(testError)
		.then(() => {
			expect(debug).toHaveBeenCalledTimes(2);
		});
});

test('readOptionalFileNotSafe', () => {
	const pathExists = fse.pathExists as unknown as jest.Mock<Promise<boolean>, [string]>;
	pathExists.mockResolvedValue(true);

	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockResolvedValue(testJsonContent);

	expect.assertions(7);

	const task = readOptionalFileNotSafe(testFilePath);
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toStrictEqual(O.some(testJsonContent))
		.then(() => {
			expect(debug).toBeCalledTimes(1);

			expect(pathExists).toHaveBeenCalledTimes(1);
			expect(pathExists).toHaveBeenCalledWith(testFilePath);

			expect(readFile).toHaveBeenCalledTimes(1);
			expect(readFile).toHaveBeenCalledWith(testFilePath, {encoding: 'utf8'});
		});
});

test('readOptionalFileNotSafe - no file', () => {
	const pathExists = fse.pathExists as unknown as jest.Mock<Promise<boolean>, [string]>;
	pathExists.mockResolvedValue(false);

	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockClear();

	expect.assertions(3);

	const task = readOptionalFileNotSafe(testFilePath);

	return expect(task()).resolves.toBe(O.none)
		.then(() => {
			expect(debug).toBeCalledTimes(1);
			expect(readFile).toHaveBeenCalledTimes(0);
		});
});

test('readOptionalFileNotSafe - pathExists failed', () => {
	const pathExists = fse.pathExists as unknown as jest.Mock<Promise<boolean>, [string]>;
	pathExists.mockRejectedValue(testError);

	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockClear();

	expect.assertions(3);

	const task = readOptionalFileNotSafe(testFilePath);

	return expect(task()).rejects.toBe(testError)
		.then(() => {
			expect(debug).toBeCalledTimes(2);
			expect(readFile).toHaveBeenCalledTimes(0);
		});
});

test('readOptionalFileNotSafe - pathExists failed', () => {
	const pathExists = fse.pathExists as unknown as jest.Mock<Promise<boolean>, [string]>;
	pathExists.mockResolvedValue(true);

	const readFile = fse.readFile as unknown as jest.Mock<Promise<string>, [string, {encoding: string}]>;
	readFile.mockRejectedValue(testError);

	expect.assertions(2);

	const task = readOptionalFileNotSafe(testFilePath);

	return expect(task()).rejects.toBe(testError)
		.then(() => {
			expect(debug).toBeCalledTimes(2);
		});
});

test('parseJsonDataNotSafe - valid JSON', () => {
	expect(parseJsonDataNotSafe(testJsonContent)).toStrictEqual(testJsonData);
});

test('parseJsonDataNotSafe - invalid data format (only string props)', () => {
	expect(() => {
		parseJsonDataNotSafe(JSON.stringify({prop1: 1}));
	}).toThrowError('Invalid data format');

	expect(debug).toHaveBeenCalledTimes(1);
});

test('parseJsonDataNotSafe - invalid JSON', () => {
	expect(() => {
		parseJsonDataNotSafe('');
	}).toThrowError();

	expect(debug).toHaveBeenCalledTimes(1);
});
