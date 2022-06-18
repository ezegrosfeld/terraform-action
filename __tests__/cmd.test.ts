import {expect, test} from '@jest/globals';
import {getCommand, isCommand, Commands} from '../src/utils/cmd';
import {isAllModified, isAllServices} from "../src/utils/flags";

test('Get command from string', async () => {
    const command = getCommand('terraform plan -d infra/terraform/mex -w dev');
    expect(command).toBe(Commands.Plan);
});

test('Get command from string with "-"', async () => {
    const command = getCommand(
        'terraform plan-destroy -d infra/terraform/mex -w dev'
    );
    expect(command).toBe(Commands.PlanDestroy);
});

test('Check if given command is a terraform command', async () => {
    const ic = isCommand('terraform plan -d infra/terraform/mex -w dev');
    const nic = isCommand('im not a command');
    expect(ic).toBe(true);
    expect(nic).toBe(false);
});


test('Check if given command is for all services', async () => {
    const ia = isAllServices('terraform plan --all');
    expect(ia).toBe(true);
})


test('Check if given command is for all modified services', async () => {
    const ia = isAllModified('terraform plan --mod');
    expect(ia).toBe(true);
})