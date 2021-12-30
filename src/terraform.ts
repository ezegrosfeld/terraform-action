import { exec } from 'child_process';
import { apply } from './apply';
import { plan } from './plan';
import { Commands } from './utils/cmd';
import { setWorkspace } from './workspace';
import * as core from '@actions/core';

export const executeTerraform = (
	cmd: Commands,
	dir: string,
	workspace: string
): void => {
	try {
		if (dir !== '') {
			process.chdir(dir);
		}

		terraformInit();

		if (workspace !== '') {
			setWorkspace(workspace);
		}

		switch (cmd) {
			case Commands.Plan:
				plan();
				break;
			case Commands.Apply:
				apply();
				break;
			default:
				break;
		}
	} catch (e: any) {
		throw new Error(e);
	}
};

const terraformInit = () => {
	core.startGroup('Terraform Init');
	exec("echo 'HELO'", (err, stdout, stderr) => {
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
