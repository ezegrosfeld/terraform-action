import * as core from '@actions/core';
import * as github from '@actions/github';
import {runFromComment, runFromPR} from './executions';
import {Terraform} from './terraform';
import {getWorkspace} from './utils/flags';
import {Configuration} from "./configuration";

const run = async (): Promise<void> => {
    try {
        const gh = github.getOctokit(core.getInput('github_token'));
        const terra = new Terraform(gh);
        core.info('Getting configuration')
        const config = new Configuration(core.getInput('config_file')).getConfiguration()

        terra.workspace(config.default_workspace)

        const comment = github.context.payload.comment;
        if (typeof comment === 'undefined' || !comment) {
            terra.workspace(config.pr_workspace)
            await runFromPR(gh, terra);
            return;
        }

        const body = comment['body'] as string;

        const workspace = getWorkspace(body);
        if (workspace != '') {
            terra.workspace(workspace);
        }

        await runFromComment(body, gh, terra);
    } catch (err) {
        console.log(err);
        if (err instanceof Error) core.setFailed(err.message);
    }
};

run();
