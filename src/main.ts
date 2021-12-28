import * as core from '@actions/core';
import * as github from '@actions/github';
import { Commands, getCommand, isCommand } from './utils/cmd';
import { getDir, getWorkspace } from './utils/flags';

const run = async (): Promise<void> => {
	try {
		const body = github.context.payload.comment!['body'] as string;
		if (typeof body === 'undefined' || !body) {
			throw new Error('No issue body found');
		}
		core.info(`Body is: ${body}`);
		if (!isCommand(body)) {
			core.info('No command found');
			return;
		}

		const command = getCommand(body);
		core.info(`Running ${command}`);

		if (command === Commands.Null) {
			throw new Error('Invalid terraform commands');
		}

		const dir = getDir(body);
		core.info(`Directory is: ${dir}`);

		const workspace = getWorkspace(body);
		core.info(`Workspace is: ${workspace}`);
	} catch (err) {
		if (err instanceof Error) core.setFailed(err.message);
	}
};

run();
