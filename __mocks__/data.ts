import { JsonData } from "../src/json-data";

export const testFilePath = 'nls/eng.json';

export const testJsonContent = `{
	"key1": "one",
	"key2": "two",
	"key3": "three"
}`;

export const testJsonData: JsonData = {
	key1: 'one',
	key2: 'two',
	key3: 'three',
};

export const testOutFile = `{"key1":"one","key2":"2","key3":"three"}`;

export const testError = new Error('test');

export const testCustomData: JsonData = {
  key2: '2',
	key3: 'three',
};

export const testMergeResult: JsonData = {
	key1: 'one',
	key2: '2',
	key3: 'three',
};

export const testRelativeFilePath = 'eng.json';