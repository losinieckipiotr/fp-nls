import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Task';

import { testFilePath, testJsonContent, testJsonData } from '../../__mocks__/data';
import { JsonData } from '../../src/json-data';
import { getCustomData } from '../../src/main';
import { parseJsonDataNotSafe, readOptionalFileNotSafe } from '../../src/not-safe';

jest.mock('../../src/not-safe', () => {
	return {
		cleanOutputFolderNotSafe: jest.fn(),
		getTranslationFilesNotSafe: jest.fn(),
		parseJsonDataNotSafe: jest.fn(),
		readFileNotSafe: jest.fn(),
		readOptionalFileNotSafe: jest.fn(),
		saveFileNotSafe: jest.fn(),
	};
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
