export const formatOutput = (output: string): string => {
	// remove all commands that have :: in them
	const outputLines = output.split('\n').filter((line) => !line.includes('::'));

	// remove the first line
	const formattedLines = outputLines.slice(1);

	// join the remaining lines
	output = formattedLines.join('\n');

	output = output.replace(
		/[\u001b\u009b][[()#;?](?:[0-9]{1,4}(?:;[0-9]{0,4}))?[0-9A-ORZcf-nqry=><]/g,
		''
	);
	output = output.replace(
		/No changes. No objects need to be destroyed./g,
		'+ No changes. No objects need to be destroyed.'
	);
	output = output.replace(
		/No changes. Infrastructure is up-to-date./g,
		'+ No changes. Infrastructure is up-to-date.'
	);
	output = output.replace(/Destroy complete!/g, '- Destroy complete!');
	output = output.replace(/Apply complete!/g, '+ Apply complete!');
	output = output.replace(
		/No changes. Your infrastructure matches the configuration./g,
		'+ No changes. Your infrastructure matches the configuration.'
	);
	output = output.replace(
		/No changes. Your infrastructure still matches the configuration./g,
		'+ No changes. Your infrastructure still matches the configuration.'
	);
	output = output.replace(/Refreshing state... /g, '');
	output = output.replace(/Error:/g, '- Error:');
	output = output.replace(/\  \-/g, '-');
	output = output.replace(/\  \+/g, '+');
	output = output.replace(/\  \~/g, '!');
	output = output.replace(/\    \-/g, '-  ');
	output = output.replace(/\    \+/g, '+  ');
	output = output.replace(/\    \~/g, '!  ');
	output = output.replace(/----/g, '====');
	return output;
};
