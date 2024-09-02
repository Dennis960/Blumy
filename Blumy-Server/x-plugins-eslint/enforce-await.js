// @ts-check
import ts from 'typescript';

export default {
	rules: {
		/**
		 * @type {import('eslint').Rule.RuleModule}
		 */
		'enforce-await': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Enforce that async functions marked using @enforce-await are awaited',
					category: 'Possible Errors',
					recommended: true
				},
				schema: [],
				messages: {
					missingAwait:
						"Function '{{name}}' should be awaited as it is marked with '@enforce-await'"
				},
				fixable: 'code'
			},
			create(context) {
				const sourceCode = context.sourceCode;
				const parserServices = sourceCode.parserServices;
				/**
				 * @type {import('typescript').TypeChecker}
				 */
				const checker = parserServices.program.getTypeChecker();

				return {
					CallExpression(node) {
						const callee = node.callee;
						const name = sourceCode.getText(callee);
						const symbol = checker.getSymbolAtLocation(
							parserServices.esTreeNodeToTSNodeMap.get(callee)
						);
						if (!symbol) {
							return;
						}
						const declarations = symbol.getDeclarations();
						if (!declarations) {
							return;
						}
						const declaration = declarations[0];
						const commentRanges = ts.getLeadingCommentRanges(declaration.getFullText(), 0);
						if (!commentRanges) {
							return;
						}
						const comments = commentRanges.map((range) =>
							declaration.getFullText().slice(range.pos, range.end)
						);
						if (!comments.some((comment) => comment.includes('@enforce-await'))) {
							return;
						}

						if (node.parent.type === 'AwaitExpression') {
							return;
						}
						/**
						 * @type {import('typescript').Node}
						 */
						const tsNode = parserServices.esTreeNodeToTSNodeMap.get(callee);
						if (!tsNode) {
							return;
						}
						const type = checker.getTypeAtLocation(tsNode);
						const signatures = type.getCallSignatures();
						if (!signatures.length) {
							return;
						}
						const returnType = checker.getReturnTypeOfSignature(signatures[0]);
						const isPromise = returnType.symbol?.name === 'Promise';
						if (!isPromise) {
							return;
						}

						context.report({
							node: node,
							messageId: 'missingAwait',
							data: { name },
							fix: (fixer) => {
								return fixer.insertTextBefore(node, 'await ');
							}
						});
					}
				};
			}
		}
	}
};
