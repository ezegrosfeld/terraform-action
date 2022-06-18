import * as core from '@actions/core';
import * as github from '@actions/github';
import {Client, Terraform} from './terraform';
import {Commands, getCommand, isCommand} from './utils/cmd';
import {getDir, isAllModified, isAllServices} from './utils/flags';

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

        if (isAllServices(body)) {
            // not implemented
            throw new Error('not implemented')
        } else if (isAllModified(body)) {
            let dirs = await getModifiedServices(gh);
            core.info(`Modified terraform services: ${dirs}`);
            for (let d of dirs) {
                await terra.executeTerraform(command, d);
            }
        } else {
            await terra.executeTerraform(command, dir);
        }
    } catch (err) {
        console.log(err);
        if (err instanceof Error) core.setFailed(err.message);
    }
};

export const runFromPR = async (gh: Client, terra: Terraform) => {
    try {
        // Get PR number and modified files
        let dirs = await getModifiedServices(gh)

        core.info(`Modified terraform services: ${dirs}`);

        // for each directory run terraform plan
        for (let d of dirs) {
            await terra.executeTerraform(Commands.Plan, d);
        }
    } catch (err) {
        console.log(err);
        if (err instanceof Error) core.setFailed(err.message);
    }
};

const getModifiedServices = async (gh: Client): Promise<string[]> => {
    const pr = github.context.payload.pull_request!;
    const prNumber = pr.number;

    const files = await gh.rest.pulls.listFiles({
        ...github.context.repo,
        pull_number: prNumber,
    });

    // Get directories that have a main.tf file
    let services = files.data
        .map((file) => file.filename)
        .filter((file) => file.endsWith('main.tf'))
        .filter((dir) => !dir.includes('modules'))
        .map((dir) => dir.split('/').slice(0, -1).join('/'));

    return Array.from(new Set(services))
}