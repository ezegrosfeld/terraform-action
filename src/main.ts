import * as core from '@actions/core';
import * as github from '@actions/github';
import { Terraform } from './terraform';
import { Commands, getCommand, isCommand } from './utils/cmd';
import { getDir, getWorkspace } from './utils/flags';

const run = async (): Promise<void> => {
	try {
		const body = github.context.payload.comment!['body'] as string;
		if (typeof body === 'undefined' || !body) {
			throw new Error('No issue body found');
		}
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

		// react to comment event with rocket emoji
		const emoji = 'rocket';
		const gh = await github.getOctokit(core.getInput('github_token'));

		await gh.rest.reactions.createForIssueComment({
			...github.context.repo,
			comment_id: github.context.payload.comment!.id,
			content: emoji
		});

		const terra = new Terraform(gh, workspace);
		await terra.executeTerraform(command, dir);
	} catch (err) {
		console.log(err);
		if (err instanceof Error) core.setFailed(err.message);
	}
};

run();
