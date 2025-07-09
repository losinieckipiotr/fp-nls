import * as fse from 'fs-extra';

import { testCfg } from '../__mocks__/testCfg';

jest.mock('fs-extra');

import { debug, cleanOutputFolderNotSafe } from '../src/main';

jest.mock('fs-extra');

let spy: jest.SpyInstance;

beforeEach(() => {
	spy = jest.spyOn(console, 'log').mockImplementation();
});

afterEach(() => {
	spy.mockRestore();
})

test('debug function should call console.log with multiple arguments', () => {
	const args = [
		'arg1',
		'arg2',
		3,
		{arg: 4},
	];

	debug('test');
	debug(...args);

	expect(console.log).toHaveBeenCalledTimes(2);
	expect(console.log).toHaveBeenNthCalledWith(1, 'test');
	expect(console.log).toHaveBeenNthCalledWith(2, ...args);
});

test('cleanOutputFolderNotSafe should call fs-extra.remove()', () => {
	const remove = fse.remove as jest.Mock<Promise<void>, [string]>;
	remove.mockResolvedValue();

	const task = cleanOutputFolderNotSafe();

	expect(typeof task).toBe('function');

	expect(task()).resolves.toBeUndefined();

	expect(remove).toHaveBeenCalledTimes(1);
	expect(remove).toHaveBeenCalledWith(testCfg.OUTPUT_PATH);
});
