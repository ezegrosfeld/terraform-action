import * as core from '@actions/core';
import * as github from '@actions/github';
import { Client, Terraform } from './terraform';
import { Commands, getCommand, isCommand } from './utils/cmd';
import { getDir, getWorkspace } from './utils/flags';

export const runFromComment = async (
	body: string,
	gh: Client,
	terra: Terraform
) => {
	try {
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

		// react to comment event with rocket emoji
		const emoji = 'rocket';

		gh.rest.reactions.createForIssueComment({
			...github.context.repo,
			comment_id: github.context.payload.comment!.id,
			content: emoji
		});

		await terra.executeTerraform(command, dir);
	} catch (err) {
		console.log(err);
		if (err instanceof Error) core.setFailed(err.message);
	}
};

export const runFromPR = async (gh: Client, terra: Terraform) => {
	try {
		// Get PR number and modified files
		const pr = github.context.payload.pull_request!;
		const prNumber = pr.number;

		const files = await gh.rest.pulls.listFiles({
			...github.context.repo,
			pull_number: prNumber
		});

		// Get directories that have .tf files
		const dirs = files.data
			.map((file) => file.filename)
			.filter((file) => file.endsWith('.tf'));

		core.info(`Modified terraform files: ${dirs}`);

		// Get only the directory path
		const dir = dirs.map((dir) => dir.split('/').slice(0, -1).join('/'));

		core.info(`Modified terraform directories: ${dir}`);

		// for each directory run terraform plan
		for (const d of dir) {
			await terra.executeTerraform(Commands.Plan, d);
		}
	} catch (err) {
		console.log(err);
		if (err instanceof Error) core.setFailed(err.message);
	}
};
