import { exec } from 'child_process';
import { apply } from './apply';
import { plan } from './plan';
import { Commands } from './utils/cmd';
import { setWorkspace } from './workspace';
import * as core from '@actions/core';

export const executeTerraform = async (
	cmd: Commands,
	dir: string,
	workspace: string
): Promise<void> => {
	try {
		if (dir !== '') {
			process.chdir(dir);
		}

		await terraformInit();

		/* if (workspace !== '') {
			await setWorkspace(workspace);
		}

		switch (cmd) {
			case Commands.Plan:
				await plan();
				break;
			case Commands.Apply:
				await apply();
				break;
			default:
				break;
		} */
	} catch (e: any) {
		throw new Error(e);
	}
};

const terraformInit = async () => {
	core.startGroup('Terraform Init');
	await exec('terraform init', (err, stdout, stderr) => {
		if (err) {
			throw new Error(err.message);
		}

		if (stderr) {
			throw new Error(stderr);
		}

		console.log(stdout);
	});
	core.endGroup();
};
