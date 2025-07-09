import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';

import { testCustomData, testFilePath, testJsonContent, testJsonData, testMergeResult } from '../__mocks__/data';
import { debug } from '../src/debug';
import { getCustomData, mergeJsonData } from '../src/main';
import { parseJsonDataNotSafe, readOptionalFileNotSafe } from '../src/not-safe';
import { JsonData } from '../src/json-data';

jest.mock('../src/debug', () => {
	return {
		debug: jest.fn(() => {}),
	};
});
jest.mock('../src/not-safe', () => {
	return {
		cleanOutputFolderNotSafe: jest.fn(),
		getTranslationFilesNotSafe: jest.fn(),
		parseJsonDataNotSafe: jest.fn(),
		readFileNotSafe: jest.fn(),
		readOptionalFileNotSafe: jest.fn(),
		saveFileNotSafe: jest.fn(),
	};
});


beforeEach(() => {
	const debugMock = debug as jest.Mock<void>;
	debugMock.mockClear();

	const readOptionalFileMock = readOptionalFileNotSafe as jest.Mock<T.Task<O.Option<string>>, [string]>;
	readOptionalFileMock.mockClear();

	const parseJsonDataNotSafeMock = parseJsonDataNotSafe as jest.Mock<JsonData, [string]>;
	parseJsonDataNotSafeMock.mockClear();
});

test('getCustomData', () => {
	const readOptionalFileMock = readOptionalFileNotSafe as jest.Mock<T.Task<O.Option<string>>, [string]>;
	readOptionalFileMock.mockImplementation(() => {
		return T.task.of(O.some(testJsonContent));
	});
	const parseJsonDataNotSafeMock = parseJsonDataNotSafe as jest.Mock<JsonData, [string]>;
	parseJsonDataNotSafeMock.mockImplementation(() => {
		return testJsonData;
	});

	expect.assertions(6);

	const task = getCustomData(testFilePath);
	expect(typeof task).toBe('function');

	return expect(task()).resolves.toStrictEqual(O.some(testJsonData))
		.then(() => {
			expect(readOptionalFileMock).toHaveBeenCalledTimes(1);
			expect(readOptionalFileMock).toHaveBeenCalledWith(testFilePath);

			expect(parseJsonDataNotSafeMock).toHaveBeenCalledTimes(1);
			expect(parseJsonDataNotSafeMock).toHaveBeenCalledWith(testJsonContent);
		});
});

test('mergeJsonData', () => {
	expect(mergeJsonData(testCustomData, testJsonData)).toStrictEqual(testMergeResult);
	expect(debug).toHaveBeenCalledTimes(1);
});

// test('onCustomFolder', () => {
// 	const CFG = getConfig();
// 	const task = onCustomFolder(CFG.CUSTOM_FOLDER, testJsonData, testRelativeFilePath);
// 	expect(typeof task).toBe('function');
// });
