import * as core from '@actions/core';
import * as github from '@actions/github';
import { runFromComment, runFromPR } from './executions';
import { Terraform } from './terraform';
import { getWorkspace } from './utils/flags';

const run = async (): Promise<void> => {
	try {
		const gh = await github.getOctokit(core.getInput('github_token'));
		const terra = new Terraform(gh);

		const body = github.context.payload.comment!['body'] as string;
		if (typeof body === 'undefined' || !body) {
			await runFromPR(gh, terra);
		}

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
