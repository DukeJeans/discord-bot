const { token, clientId, guildId } = require('./config.json');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fileSystem = require('node:fs');
const pathUtility = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = pathUtility.join(__dirname, 'commands');
const commandFiles = fileSystem.readdirSync(commandsPath).filter(file =>  file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = pathUtility.join(commandsPath, file);
	const selectedCommand = require(filePath);
	if('data' in selectedCommand && 'execute' in selectedCommand) {
		client.commands.set(selectedCommand.data.name, selectedCommand);
	}
	else {
		console.log(`$$$ Error: Command at ${filePath} is missing a required property. This has prevented its addition to the command collection.`);
	}
}

/*---------------------------------------------*/

client.on(Events.InteractionCreate, async interation => {
	if(!interation.isChatInputCommand()) return;
	console.log(interation);

	const command = interation.client.commands.get(interation.commandName);

	if(!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interation);
	} 
	catch(error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

/*---------------------------------------------*/

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);