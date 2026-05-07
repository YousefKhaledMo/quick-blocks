import {App, Command} from "obsidian";

interface CommandRegistry {
	commands: Record<string, Command>;
	executeCommandById(commandId: string): boolean;
}

export function getCommandRegistry(app: App): CommandRegistry | null {
	return (app as App & {commands?: CommandRegistry}).commands ?? null;
}

export function getCommandPaletteCommands(app: App): Command[] {
	const registry = getCommandRegistry(app);
	if (!registry) {
		return [];
	}

	return Object.values(registry.commands)
		.filter((command) => command.id && command.name)
		.sort((first, second) => first.name.localeCompare(second.name));
}

export function executeCommandPaletteCommand(app: App, commandId: string): boolean {
	return getCommandRegistry(app)?.executeCommandById(commandId) ?? false;
}
