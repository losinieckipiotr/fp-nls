import { getConfig } from '../../src/config';
import { onCustomFolder } from '../../src/main';
import { testJsonData, testRelativeFilePath } from '../../__mocks__/data';

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

test('onCustomFolder', () => {
  const CFG = getConfig();

	const task = onCustomFolder(CFG.CUSTOM_FOLDER, testJsonData, testRelativeFilePath);
  expect(typeof task).toBe('function');

  // move getCustomData to separate folder ??
});
