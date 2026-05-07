import {App, PluginSettingTab, Setting} from "obsidian";
import {getCommandPaletteCommands} from "./commandRegistry";
import NotionLikeSlashMenuPlugin from "./main";
import {getSlashCommandPreviewText, SLASH_COMMANDS, TriggerBehavior} from "./slashCommands";

export class SlashMenuSettingTab extends PluginSettingTab {
	plugin: NotionLikeSlashMenuPlugin;

	constructor(app: App, plugin: NotionLikeSlashMenuPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Trigger keys")
			.setDesc("Use commas to add more than one trigger, for example /, ;;, +")
			.addText((text) => {
				text
					.setPlaceholder("/")
					.setValue(this.plugin.settings.triggerKeys)
					.onChange(async (value) => {
						this.plugin.settings.triggerKeys = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Trigger behavior")
			.setDesc("Choose where typed trigger keys should open the slash menu.")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("anywhere", "Anywhere")
					.addOption("line-start", "Line start only")
					.addOption("after-whitespace", "After whitespace")
					.setValue(this.plugin.settings.triggerBehavior)
					.onChange(async (value) => {
						this.plugin.settings.triggerBehavior = value as TriggerBehavior;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Show descriptions")
			.setDesc("Show the smaller preview line under each slash menu option.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.showDescriptions)
					.onChange(async (value) => {
						this.plugin.settings.showDescriptions = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Slash menu commands")
			.setHeading();

		for (const command of SLASH_COMMANDS) {
			new Setting(containerEl)
				.setName(command.label)
				.setDesc(getSlashCommandPreviewText(command))
				.addToggle((toggle) => {
					toggle
						.setValue(this.plugin.settings.commands[command.id])
						.onChange(async (value) => {
							this.plugin.settings.commands[command.id] = value;
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((button) => {
					button
						.setIcon(this.plugin.settings.pinnedCommandIds.includes(command.id) ? "star" : "star-off")
						.setTooltip("Pin command")
						.onClick(async () => {
							await this.togglePinnedCommand(command.id);
						});
				});
		}

		this.displayCustomSnippetSettings(containerEl);
		this.displayCommandPaletteSettings(containerEl);
	}

	private displayCustomSnippetSettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Custom snippets")
			.setDesc("Create your own slash command. Give it a name, optional search words, and the text to insert.")
			.setHeading();

		let label = "";
		let aliases = "";
		let insertText = "";
		let icon = "sparkles";

		new Setting(containerEl)
			.setName("Add custom snippet")
			.setDesc("Example: name Meeting note, search words meeting, text ## ${cursor}. Use ${date} for today's date and ${time} for the current time.")
			.addText((text) => {
				text
					.setPlaceholder("Name shown in the menu")
					.onChange((value) => {
						label = value;
					});
			})
			.addText((text) => {
				text
					.setPlaceholder("Search words, optional")
					.onChange((value) => {
						aliases = value;
					});
			})
			.addTextArea((text) => {
				text
					.setPlaceholder("Text to insert, for example ## ${cursor}")
					.onChange((value) => {
						insertText = value;
					});
			})
			.addText((text) => {
				text
					.setPlaceholder("Icon name")
					.setValue(icon)
					.onChange((value) => {
						icon = value.trim() || "sparkles";
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Add")
					.setCta()
					.onClick(async () => {
						const normalizedLabel = label.trim();
						if (!normalizedLabel || !insertText) {
							return;
						}

						this.plugin.settings.customCommands.push({
							id: createStableCustomId(normalizedLabel, this.plugin.settings.customCommands.map((command) => command.id)),
							label: normalizedLabel,
							aliases: parseAliases(aliases),
							insertText,
							icon,
							enabled: true,
						});
						await this.plugin.saveSettings();
						this.display();
					});
			});

		for (const command of this.plugin.settings.customCommands) {
			new Setting(containerEl)
				.setName(command.label)
				.setDesc(getSlashCommandPreviewText({
					type: "custom",
					id: `custom:${command.id}`,
					customCommandId: command.id,
					label: command.label,
					aliases: command.aliases,
					insertText: command.insertText,
					icon: command.icon,
				}))
				.addToggle((toggle) => {
					toggle
						.setValue(command.enabled)
						.onChange(async (value) => {
							command.enabled = value;
							await this.plugin.saveSettings();
						});
				})
				.addText((text) => {
					text
						.setPlaceholder(command.label)
						.setValue(command.label)
						.onChange(async (value) => {
							command.label = value.trim() || command.label;
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((button) => {
					const commandId = `custom:${command.id}`;
					button
						.setIcon(this.plugin.settings.pinnedCommandIds.includes(commandId) ? "star" : "star-off")
						.setTooltip("Pin snippet")
						.onClick(async () => {
							await this.togglePinnedCommand(commandId);
						});
				})
				.addButton((button) => {
					button
						.setButtonText("Remove")
						.onClick(async () => {
							this.plugin.settings.customCommands = this.plugin.settings.customCommands.filter((item) => item.id !== command.id);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		}
	}

	private displayCommandPaletteSettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Command palette")
			.setHeading();

		const commands = getCommandPaletteCommands(this.app);
		let selectedCommandId = commands[0]?.id ?? "";

		new Setting(containerEl)
			.setName("Add command")
			.setDesc("Choose any command from Obsidian's command palette and add it to the slash menu.")
			.addDropdown((dropdown) => {
				for (const command of commands) {
					dropdown.addOption(command.id, command.name);
				}

				dropdown.onChange((value) => {
					selectedCommandId = value;
				});
			})
			.addButton((button) => {
				button
					.setButtonText("Add")
					.setCta()
					.onClick(async () => {
						const command = commands.find((item) => item.id === selectedCommandId);
						if (!command) {
							return;
						}
						if (this.plugin.settings.commandPaletteCommands.some((item) => item.commandId === command.id)) {
							return;
						}

						this.plugin.settings.commandPaletteCommands.push({
							id: `${command.id}-${Date.now()}`,
							commandId: command.id,
							label: command.name,
							aliases: [],
							enabled: true,
						});
						await this.plugin.saveSettings();
						this.display();
					});
			});

		for (const command of this.plugin.settings.commandPaletteCommands) {
			new Setting(containerEl)
				.setName(command.label)
				.setDesc(command.commandId)
				.addToggle((toggle) => {
					toggle
						.setValue(command.enabled)
						.onChange(async (value) => {
							command.enabled = value;
							await this.plugin.saveSettings();
						});
				})
				.addText((text) => {
					text
						.setPlaceholder(command.label)
						.setValue(command.label)
						.onChange(async (value) => {
							command.label = value.trim() || command.commandId;
							await this.plugin.saveSettings();
						});
				})
				.addText((text) => {
					text
						.setPlaceholder("Aliases")
						.setValue(command.aliases.join(", "))
						.onChange(async (value) => {
							command.aliases = parseAliases(value);
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((button) => {
					button
						.setIcon(this.plugin.settings.pinnedCommandIds.includes(command.id) ? "star" : "star-off")
						.setTooltip("Pin command")
						.onClick(async () => {
							await this.togglePinnedCommand(command.id);
						});
				})
				.addButton((button) => {
					button
						.setButtonText("Remove")
						.onClick(async () => {
							this.plugin.settings.commandPaletteCommands = this.plugin.settings.commandPaletteCommands.filter((item) => item.id !== command.id);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		}
	}

	private async togglePinnedCommand(commandId: string): Promise<void> {
		if (this.plugin.settings.pinnedCommandIds.includes(commandId)) {
			this.plugin.settings.pinnedCommandIds = this.plugin.settings.pinnedCommandIds.filter((id) => id !== commandId);
		} else {
			this.plugin.settings.pinnedCommandIds = [...this.plugin.settings.pinnedCommandIds, commandId];
		}

		await this.plugin.saveSettings();
		this.display();
	}
}

function parseAliases(value: string): string[] {
	return value
		.split(",")
		.map((alias) => alias.trim())
		.filter((alias, index, aliases) => alias.length > 0 && aliases.indexOf(alias) === index);
}

function createStableCustomId(label: string, existingIds: string[]): string {
	const baseId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "snippet";
	let id = baseId;
	let suffix = 2;

	while (existingIds.includes(id)) {
		id = `${baseId}-${suffix}`;
		suffix += 1;
	}

	return id;
}
