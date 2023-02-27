import type { SplittingConfig } from './config';
import { reactive, h, Text, Fragment } from 'vue';
import type { VNode } from 'vue';

const mapLines = (input: string): VNode[] => {
	const lines: string[] = input.split(/(?:<br>|[\r\n]+)/i);
	return lines.map((line) => h(Fragment, mapWords(line)));
};

const mapWords = (line: string): VNode[] => {
	const words: string[] = line.split(/\s+/i);
	return words.map((word) => h(Fragment, mapChars(word)));
};

const mapChars = (word: string): VNode[] => {
	const chars: string[] = word.split('');
	return chars.map((char) => h(Text, char));
};

const processLines = (lines: VNode[], config: SplittingConfig) => {
	return lines.map((line, index) =>
		h(
			config.lineTag,
			{
				class: config.lineClass,
				style: {
					'--line-index': index + config.lineOffset
				}
			},
			line.children
		)
	);
};

const processWords = (lines: VNode[], config: SplittingConfig): void => {
	let words = 0;
	lines.forEach((line) => {
		line.children = (line.children as VNode[]).map((word, index) => {
			return h(
				config.wordTag,
				{
					class: config.wordClass,
					style: {
						'--word-index': index + words + config.wordOffset
					}
				},
				word.children
			);
		});
		words += line.children.length;
	});
};

const processChars = (lines: VNode[], config: SplittingConfig): void => {
	let chars = 0;
	lines.forEach((line) => {
		(line.children as VNode[]).forEach((words) => {
			words.children = (words.children as VNode[]).map((char, index) => {
				return h(
					config.charTag,
					{
						class: config.charClass,
						style: {
							'--char-index': index + chars + config.charOffset
						}
					},
					char
				);
			});
			chars += words.children.length;
		});
	});
};

const processNodeMap = (nodeMap: VNode[], config: SplittingConfig) => {
	const lines = config.lines ? processLines(nodeMap, config) : nodeMap;
	if (config.words) processWords(lines, config);
	if (config.chars) processChars(lines, config);
	return lines;
};

const insertWhitespace = (nodes) => {
	nodes.forEach((node) => {
		node.children = node.children.reduce((acc, curr) => {
			acc.push(curr);
			acc.push(
				h(
					'span',
					{
						class: 'whitespace'
					},
					' '
				)
			);
			return acc;
		}, []);
	});
};

const insertLineBreaks = (nodes) => {
	return nodes.reduce((acc, curr) => {
		acc.push(curr);
		acc.push(h('br'));
		return acc;
	}, []);
};

export const processInput = (input: string, config: SplittingConfig): VNode[] => {
	// Everything will be split by chars, words and lines anyway
	// Each will be a 3-layer VNode
	// Some VNodes might be #text, others might be tags

	const nodeMap: VNode[] = mapLines(input);
	const nodes: VNode[] = processNodeMap(nodeMap, config);
	insertWhitespace(nodes);
	if (config.lines === false) return insertLineBreaks(nodes);
	else return nodes;
};
