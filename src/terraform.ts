import {exec} from 'child_process';
import {Commands} from './utils/cmd';
import {Octokit} from '@octokit/core';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {formatOutput} from './utils/ouput';

declare const GitHub: typeof Octokit &
    import('@octokit/core/dist-types/types').Constructor<import('@octokit/plugin-rest-endpoint-methods/dist-types/types').Api & {
        paginate: import('@octokit/plugin-paginate-rest').PaginateInterface;
    }>;

export type Client = InstanceType<typeof GitHub>;

export class Terraform {
    #client: Client;
    #workspace: string;
    #chdir: string;

    constructor(client: Client) {
        this.#client = client;
        this.#workspace = "dev";
        this.#chdir = ".";
    }

    dir = (dir: string) => {
        this.#chdir = dir;
    }

    workspace = (workspace: string) => {
        this.#workspace = workspace;
    };

    executeTerraform = async (cmd: Commands, dir: string): Promise<void> => {
        try {
            if (dir !== '') {
                this.#chdir = dir;
            }

            const def_dir = core.getInput('default_dir');

            if (def_dir !== '') {
                this.#chdir = def_dir;
            }

            const res = await this.#client.rest.checks.create({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: `terraform-pr-${cmd}`,
                head_sha: github.context.sha,
                status: 'in_progress',
                output: {
                    title: `Terraform ${cmd}`,
                    summary: `Running Terraform ${cmd}`,
                    text: `Running Terraform ${cmd}`,
                },
            });

            if( res.status !== 201) {
                throw new Error(`Failed to create check, status: ${res.status}`);
            }

            switch (cmd) {
                case Commands.Plan:
                    this.#terraformInit(this.#plan);
                    break;
                case Commands.Apply:
                    this.#terraformInit(this.#apply);
                    break;
                case Commands.PlanDestroy:
                    this.#terraformInit(this.#planDestroy);
                    break;
                case Commands.ApplyDestroy:
                    this.#terraformInit(this.#applyDestroy);
                    break;
                default:
                    break;
            }

            await this.#client.rest.checks.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: `terraform-pr-${cmd}`,
                head_sha: github.context.sha,
                status: 'completed',
                conclusion: 'success',
                output: {
                    title: `Terraform ${cmd}`,
                    summary: `Terraform ${cmd} completed`,
                    text: `Terraform ${cmd} completed`,
                },
            });

        } catch (e: any) {
            await this.#client.rest.checks.update({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                name: `terraform-pr-${cmd}`,
                head_sha: github.context.sha,
                status: 'completed',
                conclusion: 'failure',
                output: {
                    title: `Terraform ${cmd}`,
                    summary: `Running Terraform ${cmd}`,
                    text: `Running Terraform ${cmd}`,
                },
            });
            throw new Error(e);
        }
    };

    #terraformInit = (fn: () => void) => {
        try {
            exec(
                `terraform ${this.#chdir && '-chdir=' + this.#chdir} init -input=false`,
                (err, stdout, stderr) => {
                    core.startGroup('Terraform Init');
                    core.info(stdout);
                    if (err) {
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        throw new Error(stderr);
                    }
                    core.endGroup();
                    try {
                        this.#setWorkspace(fn);
                    } catch (e: any) {
                        throw new Error(e);
                    }
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #setWorkspace = (fn: () => void) => {
        try {
            exec(
                `terraform ${this.#chdir && '-chdir=' + this.#chdir} workspace select ${
                    this.#workspace
                } || terraform ${
                    this.#chdir && '-chdir=' + this.#chdir
                } workspace new ${this.#workspace}`,
                (err, stdout, stderr) => {
                    core.startGroup('Terraform Workspace');
                    core.info(stdout);

                    if (err) {
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        throw new Error(stderr);
                    }

                    core.endGroup();

                    try {
                        fn();
                    } catch (e: any) {
                        throw new Error(e);
                    }
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #plan = (comment: boolean = true, fn?: () => void) => {
        try {
            exec(
                `terraform ${this.#chdir && '-chdir=' + this.#chdir} plan -no-color`,
                async (err, stdout, stderr) => {
                    core.startGroup('Terraform Plan');
                    core.info(stdout);
                    if (err) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `plan` failed', comment);
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `plan` failed', comment);
                        throw new Error(stderr);
                    }

                    // add comment to issue with plan
                    if (comment) {
                        const msg = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `plan`', msg);
                    }

                    typeof fn !== 'undefined' && fn();

                    core.endGroup();
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #apply = () => {
        try {
            exec(
                `terraform ${
                    this.#chdir && '-chdir=' + this.#chdir
                } apply -no-color -auto-approve`,
                async (err, stdout, stderr) => {
                    core.startGroup('Terraform Apply');
                    core.info(stdout);

                    if (err) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `apply` failed', comment);
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `apply` failed', comment);
                        throw new Error(stderr);
                    }

                    const comment = this.#buildOutputDetails(stdout);
                    await this.#createComment('Terraform `apply`', comment);

                    core.endGroup();
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #planDestroy = (comment: boolean = true, fn?: () => void) => {
        try {
            exec(
                `terraform ${
                    this.#chdir && '-chdir=' + this.#chdir
                } plan -destroy -no-color`,
                async (err, stdout, stderr) => {
                    core.startGroup('Terraform Plan Destroy');
                    core.info(stdout);

                    if (err) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment(
                            'Terraform `plan-destroy` failed',
                            comment
                        );
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment(
                            'Terraform `plan-destroy` failed',
                            comment
                        );
                        throw new Error(stderr);
                    }

                    // add comment to issue with plan
                    if (comment) {
                        const msg = this.#buildOutputDetails(stdout);
                        await this.#createComment('Terraform `plan-destroy`', msg);
                    }

                    typeof fn !== 'undefined' && fn();

                    core.endGroup();
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #applyDestroy = () => {
        try {
            exec(
                `terraform ${
                    this.#chdir && '-chdir=' + this.#chdir
                } apply -destroy -no-color -auto-approve`,
                async (err, stdout, stderr) => {
                    core.startGroup('Terraform Apply Destroy');
                    core.info(stdout);

                    if (err) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment(
                            'Terraform `apply-destroy` failed',
                            comment
                        );
                        throw new Error(err.message);
                    }

                    if (stderr) {
                        const comment = this.#buildOutputDetails(stdout);
                        await this.#createComment(
                            'Terraform `apply-destroy` failed',
                            comment
                        );
                        throw new Error(stderr);
                    }

                    const comment = this.#buildOutputDetails(stdout);
                    await this.#createComment('Terraform `apply-destroy`', comment);

                    core.endGroup();
                }
            );
        } catch (e: any) {
            throw new Error(e);
        }
    };

    #createComment = async (title: string, comment: string) => {
        const msg = `## ${title}: \n\n${comment}`;

        await this.#client.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: msg,
        });
    };

    #buildOutputDetails = (details: string): string => {
        return `<details><summary>Show output</summary>\n\n\`\`\`diff\n${formatOutput(
            details
        )}\n\`\`\`\n\n</details>`;
    };
}
