import * as core from '@actions/core';
import * as github from '@actions/github';
import { isCommand } from './utils/cmd';

const run = async (): Promise<void> => {
	try {
		const body = github.context.payload.issue?.body;
		if (!body) {
			core.setFailed('No issue body found');
			return;
		}
		core.info(`Body: ${body}`);
		if (!isCommand(body)) {
			core.info('No command found');
			return;
		}
	} catch (err) {
		if (err instanceof Error) core.setFailed(err.message);
	}
};

run();
