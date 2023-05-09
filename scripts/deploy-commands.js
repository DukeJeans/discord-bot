const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
const fileSystem = require('node:fs');
const pathUtility = require('node:path');

const commands = [];
const commandsPath = pathUtility.join(__dirname, '../commands');
const commandFiles = fileSystem.readdirSync(commandsPath).filter(file =>  file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = pathUtility.join(commandsPath, file);
	const selectedCommand = require(filePath);
	if('data' in selectedCommand && 'execute' in selectedCommand) {
		commands.push(selectedCommand.data.toJSON());
	}
	else {
		console.log(`$$$ Error: Command at ${filePath} is missing a required property. This has prevented its addition to the command collection.`);
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();