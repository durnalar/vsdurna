import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { FunctionDefinition } from './types';

const functionsPath = path.join(__dirname, '..', 'data', 'functions.json');
const functions: FunctionDefinition[] = JSON.parse(fs.readFileSync(functionsPath, 'utf8'));

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			{ language: 'durna', scheme: 'file' },
			{
				provideCompletionItems(document, position, token, context) {
					const line = document.lineAt(position).text;
					const prefix = line.substring(0, position.character);
					const insideString = /"(.*?)$/.test(prefix);

					if (!insideString) {
						return undefined;
					}

					const items = functions.map(func => {
						const item = new vscode.CompletionItem(func.name, vscode.CompletionItemKind.Function);
						item.detail = func.description;

						const params = func.inputs.map(input => `${input.name}: ${input.type}${input.required ? '' : '?'}`);
						item.insertText = func.name;
						item.documentation = new vscode.MarkdownString(
							`**${func.name}**\n\n${func.description}\n\n` +
							(params.length ? `**inputs:**\n- ${params.join('\n- ')}\n\n` : '') +
							`**Output:** \`${func.output.type}\` - ${func.output.description}`
						);

						return item;
					});

					return items;
				}
			},
			'"'
		)
	);

	context.subscriptions.push(
		vscode.languages.registerHoverProvider('durna', {
			provideHover(document, position, token) {
				const wordRange = document.getWordRangeAtPosition(position, /[\w\d_]+/);
				if (!wordRange) return;

				const word = document.getText(wordRange);
				const func = functions.find(f => f.name === word);
				if (!func) return;

				const markdown = new vscode.MarkdownString();
				markdown.appendMarkdown(`### ${func.name}\n`);
				markdown.appendMarkdown(`${func.description}\n\n`);

				if (func.inputs?.length) {
					markdown.appendMarkdown(`**Inputs:**\n`);
					func.inputs.forEach(input => {
						markdown.appendMarkdown(
							`- \`${input.name}: ${input.type}${input.required ? '' : ' (Optional)'}\` — ${input.description}\n`
						);
					});
					markdown.appendMarkdown('\n');
				}

				if (func.output) {
					markdown.appendMarkdown(`**Output:** \`${func.output.type}\` — ${func.output.description}`);
				}

				markdown.supportHtml = true;
				markdown.isTrusted = true;

				return new vscode.Hover(markdown, wordRange);
			}
		})
	);

}

export function deactivate() { }
