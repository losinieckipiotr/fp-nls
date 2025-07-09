import * as fse from 'fs-extra';
import glob from 'glob';

import { testCfg } from '../__mocks__/testCfg';

import {
	cleanOutputFolderNotSafe,
	getTranslationFilesNotSafe,
} from '../src/main';

import {
	debug
} from '../src/utils';
import path from 'path';

jest.mock('fs-extra');
jest.mock('glob');
jest.mock('fs-extra');

let spy: jest.SpyInstance;

beforeEach(() => {
	spy = jest.spyOn(console, 'log').mockImplementation();
});

afterEach(() => {
	spy.mockRestore();
})

test('debug function should call console.log with multiple arguments only if debug flag is true', () => {
	const args = [
		'arg1',
		'arg2',
		3,
		{arg: 4},
	];

	debug(false, 'test');
	debug(false, ...args);

	expect(console.log).not.toHaveBeenCalled();

	debug(true, 'test');
	debug(true, ...args);

	expect(console.log).toHaveBeenCalledTimes(2);
	expect(console.log).toHaveBeenNthCalledWith(1, 'test');
	expect(console.log).toHaveBeenNthCalledWith(2, ...args);
});

test('cleanOutputFolderNotSafe should call debug and fs-extra.remove()', () => {
	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;
	remove.mockResolvedValue();

	const task = cleanOutputFolderNotSafe();

	expect(typeof task).toBe('function');

	expect(task()).resolves.toBeUndefined();
	expect(console.log).toHaveBeenCalledTimes(1);

	expect(remove).toHaveBeenCalledTimes(1);
	expect(remove).toHaveBeenCalledWith(testCfg.OUTPUT_PATH);
});

test('cleanOutputFolderNotSafe throws error', () => {
	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;
	const testError = new Error('test');
	remove.mockRejectedValueOnce(testError);

	const task = cleanOutputFolderNotSafe();

	expect(typeof task).toBe('function');

	expect.assertions(3);

	return task()
		.catch((error) => {
			expect(error).toBe(testError);
			expect(console.log).toHaveBeenCalledTimes(2);
		});
});

test('getTranslationFilesNotSafe', () => {
	const testGlob = [
		'/home/plosiniecki/Desktop/fp-nls/nls/eng.json',
		'/home/plosiniecki/Desktop/fp-nls/nls/pl.json'
	];
	const transationFilesPattern = path.join(testCfg.ROOT_PATH, testCfg.TRANSLATIONS_FOLDER, '**/*.json');

	const globMock = (glob as unknown) as jest.Mock<void, [string, (err: any, matches: string[]) => void]>;
	globMock.mockImplementation((_, cb) => {
		cb(null, testGlob);
	});
	const task = getTranslationFilesNotSafe();

	expect.assertions(3);

	expect(typeof task).toBe('function');

	return task()
		.then((result) => {
			expect(result).toBe(testGlob);
			expect(globMock).toBeCalledWith(transationFilesPattern, expect.any(Function));
		});
});
