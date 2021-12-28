import { expect, test } from '@jest/globals';
import { getCommand, isCommand, Commands } from '../src/utils/cmd';

test('Get command from string', async () => {
	const command = getCommand('terraform plan -d infra/terraform/mex -w dev');
	expect(command).toBe(Commands.Plan);
});

test('Check if given command is a terraform command', async () => {
	const ic = isCommand('terraform plan -d infra/terraform/mex -w dev');
	const nic = isCommand('im not a command');
	expect(ic).toBe(true);
	expect(nic).toBe(false);
});
