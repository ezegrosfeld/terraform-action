import { exec } from 'child_process';
import { Commands } from './utils/cmd';
import { Octokit } from '@octokit/core';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { formatOutput } from './utils/ouput';

declare const GitHub: typeof Octokit &
	import('@octokit/core/dist-types/types').Constructor<
		import('@octokit/plugin-rest-endpoint-methods/dist-types/types').Api & {
			paginate: import('@octokit/plugin-paginate-rest').PaginateInterface;
		}
	>;

export type Client = InstanceType<typeof GitHub>;

export class Terraform {
	#client: Client;
	#workspace: string;

	constructor(client: Client) {
		this.#client = client;
		this.#workspace = 'dev';
	}

	workspace = (workspace: string) => {
		this.#workspace = workspace;
	};

	executeTerraform = async (cmd: Commands, dir: string): Promise<void> => {
		try {
			if (dir !== '') {
				core.info(`Changing directory to ${dir}`);
				process.chdir(dir);
			}

			switch (cmd) {
				case Commands.Plan:
					this.#terraformInit(this.#plan);
					break;
				case Commands.Apply:
					this.#terraformInit(() => this.#plan(false, this.#apply));
					break;
				case Commands.PlanDestroy:
					this.#terraformInit(this.#planDestroy);
					break;
				case Commands.ApplyDestroy:
					this.#terraformInit(() =>
						this.#planDestroy(false, this.#applyDestroy)
					);
					break;
				default:
					break;
			}
		} catch (e: any) {
			throw new Error(e);
		}
	};

	#terraformInit = (fn: () => void) => {
		exec('terraform init -input=false', (err, stdout, stderr) => {
			core.startGroup('Terraform Init');
			if (err) {
				throw new Error(err.message);
			}

			if (stderr) {
				throw new Error(stderr);
			}

			core.info(stdout);
			core.endGroup();
			this.#setWorkspace(fn);
		});
	};

	#setWorkspace = (fn: () => void) => {
		exec(
			`terraform workspace select ${
				this.#workspace
			} || terraform workspace new ${this.#workspace}`,
			(err, stdout, stderr) => {
				core.startGroup('Terraform Workspace');
				if (err) {
					throw new Error(err.message);
				}

				if (stderr) {
					throw new Error(stderr);
				}

				core.info(stdout);
				core.endGroup();
				fn();
			}
		);
	};

	#plan = (comment: boolean = true, fn?: () => void) => {
		exec('terraform plan -no-color', async (err, stdout, stderr) => {
			core.startGroup('Terraform Plan');

			if (err) {
				const comment = this.#buildOutputDetails(err.message);
				await this.#createComment('Terraform `plan` failed', comment);
				throw new Error(err.message);
			}

			if (stderr) {
				const comment = this.#buildOutputDetails(stderr);
				await this.#createComment('Terraform `plan` failed', comment);
				throw new Error(stderr);
			}

			core.info(stdout);

			// add comment to issue with plan
			if (comment) {
				const msg = this.#buildOutputDetails(stdout);
				await this.#createComment('Terraform `plan`', msg);
			}

			typeof fn !== 'undefined' && fn();

			core.endGroup();
		});
	};

	#apply = () => {
		exec(
			'terraform apply -no-color -auto-approve',
			async (err, stdout, stderr) => {
				core.startGroup('Terraform Apply');

				if (err) {
					const comment = this.#buildOutputDetails(err.message);
					await this.#createComment('Terraform `apply` failed', comment);
					throw new Error(err.message);
				}

				if (stderr) {
					const comment = this.#buildOutputDetails(stderr);
					await this.#createComment('Terraform `apply` failed', comment);
					throw new Error(stderr);
				}

				const comment = this.#buildOutputDetails(stdout);
				await this.#createComment('Terraform `apply`', comment);

				core.info(stdout);
				core.endGroup();
			}
		);
	};

	#planDestroy = (comment: boolean = true, fn?: () => void) => {
		exec('terraform plan -destroy -no-color', async (err, stdout, stderr) => {
			core.startGroup('Terraform Plan Destroy');

			if (err) {
				const comment = this.#buildOutputDetails(err.message);
				await this.#createComment('Terraform `plan-destroy` failed', comment);
				throw new Error(err.message);
			}

			if (stderr) {
				const comment = this.#buildOutputDetails(stderr);
				await this.#createComment('Terraform `plan-destroy` failed', comment);
				throw new Error(stderr);
			}

			core.info(stdout);

			// add comment to issue with plan
			if (comment) {
				const msg = this.#buildOutputDetails(stdout);
				await this.#createComment('Terraform `plan-destroy`', msg);
			}

			typeof fn !== 'undefined' && fn();

			core.endGroup();
		});
	};

	#applyDestroy = () => {
		exec(
			'terraform apply -destroy -no-color -auto-approve',
			async (err, stdout, stderr) => {
				core.startGroup('Terraform Apply Destroy');

				if (err) {
					const comment = this.#buildOutputDetails(err.message);
					await this.#createComment(
						'Terraform `apply-destroy` failed',
						comment
					);
					throw new Error(err.message);
				}

				if (stderr) {
					const comment = this.#buildOutputDetails(stderr);
					await this.#createComment(
						'Terraform `apply-destroy` failed',
						comment
					);
					throw new Error(stderr);
				}

				const comment = this.#buildOutputDetails(stdout);
				await this.#createComment('Terraform `apply-destroy`', comment);

				core.info(stdout);
				core.endGroup();
			}
		);
	};

	#createComment = async (title: string, comment: string) => {
		const msg = `## ${title}: \n\n${comment}`;

		await this.#client.rest.issues.createComment({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			issue_number: github.context.issue.number,
			body: msg
		});
	};

	#buildOutputDetails = (details: string): string => {
		return `<details><summary>Show output</summary>\n\n\`\`\`diff\n${formatOutput(
			details
		)}\n\`\`\`\n\n</details>`;
	};
}
