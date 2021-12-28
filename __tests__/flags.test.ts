import { expect, test } from '@jest/globals';
import { getDir, getWorkspace } from '../src/utils/flags';

test('Get dir from first directory', async () => {
	const dir = getDir('terra plan -d infra -w dev');
	expect(dir).toBe('infra');
});

test('Get dir from second directory', async () => {
	const dir = getDir('terra plan -d infra/terraform -w dev');
	expect(dir).toBe('infra/terraform');
});

test('Get dir from third directory', async () => {
	const dir = getDir('terra plan -d infra/terraform/mex -w dev');
	expect(dir).toBe('infra/terraform/mex');
});

test('Get workspace', async () => {
	const w = getWorkspace('terra plan -d infra/terraform/mex -w dev');
	expect(w).toBe('dev');
});
