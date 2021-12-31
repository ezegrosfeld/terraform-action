import * as core from '@actions/core';
import * as github from '@actions/github';
import { runFromComment, runFromPR } from './executions';
import { Terraform } from './terraform';
import { getWorkspace } from './utils/flags';

const run = async (): Promise<void> => {
	try {
		const gh = await github.getOctokit(core.getInput('github_token'));
		const terra = new Terraform(gh);

		const comment = github.context.payload.comment;
		if (typeof comment === 'undefined' || !comment) {
			await runFromPR(gh, terra);
			return;
		}

		const body = comment['body'] as string;

		const workspace = getWorkspace(body);
		core.info(`Workspace is: ${workspace}`);

		terra.workspace(workspace);

		await runFromComment(body, gh, terra);
	} catch (err) {
		console.log(err);
		if (err instanceof Error) core.setFailed(err.message);
	}
};

run();
