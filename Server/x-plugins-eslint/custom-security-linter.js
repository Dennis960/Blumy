// @ts-check
import ts from 'typescript';

export default {
	rules: {
		/**
		 * @type {import('eslint').Rule.RuleModule}
		 */
		'enforce-security-await': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Enforce that async security functions are awaited',
					category: 'Possible Errors',
					recommended: true
				},
				schema: [],
				messages: {
					missingAwait:
						"Security function '{{name}}' should be awaited"
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
						const fileName = declaration.getSourceFile().fileName;
						if (!fileName.includes('authenticated.ts')) {
							return;
						}
						// @ts-expect-error ...
						if (!declaration.initializer?.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
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
		},
		/**
		 * @type {import('eslint').Rule.RuleModule}
		 */
		'enforce-security-specification': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Ensure that every server function is properly secured',
					category: 'Possible Errors',
					recommended: true
				},
				schema: [],
				messages: {
					missingSecurityCall:
						"Every server function should be secured using '(await) (event.)locals.security.*()'"
				},
				fixable: 'code'
			},
			create(context) {
				return {
					// Check only *.server.ts files
					ExportNamedDeclaration(node) {
						/**
						 * @param {import('estree').Function | import('estree').ArrowFunctionExpression | import('estree').FunctionDeclaration | import('estree').FunctionExpression | import('estree').ArrowFunctionExpression} fun
						 * @param {string} functionName
						 */
						function checkFunction(fun, functionName) {
							if (fun.body.type !== 'BlockStatement') return;
							const firstExpression = fun.body.body[0];
							// check if first expression contains a call to security
							if (context.sourceCode.getText(firstExpression).match(/(await )?(event\.)?locals\.security\..*\(.*\)/)) {
								return;
							}
							context.report({
								node,
								message: `Function '${functionName}' should be secured using '[await] [event.]locals.security.xxx(...)'. Use 'allowAll()' if no security is required.`,
								fix: (fixer) => {
									return fixer.insertTextBefore(firstExpression, 'event.locals.security.allowNone();\n');
								}
							});
						}
						const serverFunctionNames = [
							"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD", "CONNECT", "TRACE", "load"
						];
						// abort if filename does not end in server.ts
						if (!context.filename.endsWith('server.ts')) {
							return;
						}
						// Check if the export is a function declaration
						if (node.declaration && node.declaration.type === 'FunctionDeclaration') {
							const functionName = node.declaration.id.name;
							if (serverFunctionNames.includes(functionName)) {
								checkFunction(node.declaration, functionName);
							}
						}

						// Check if the export is a variable declaration (like export const GET = ...)
						if (node.declaration && node.declaration.type === 'VariableDeclaration') {
							node.declaration.declarations.forEach((declarator) => {
								if (declarator.id && declarator.id.type === "Identifier" && declarator.id.name) {
									const variableName = declarator.id.name;

									// Check if the variable name is 'actions'
									if (variableName === 'actions' && declarator.init) {
										/**
										 * @type {import('estree').Property[]}
										 */ // @ts-expect-error ...
										const properties = declarator?.init?.expression?.properties;
										properties.forEach((property) => {
											if (property.value.type !== "ArrowFunctionExpression") return;
											// @ts-expect-error ...
											checkFunction(property.value, property.key.name);
										})
										// @ts-expect-error ...
									} else if (declarator.init?.type === 'TSSatisfiesExpression') {
										/**
										 * @type {import('@typescript-eslint/types').TSESTree.TSSatisfiesExpression}
										 */
										const tsFun = declarator.init;
										if (tsFun.expression.type === 'ArrowFunctionExpression' || tsFun.expression.type === 'FunctionExpression') {
											// @ts-expect-error ...
											checkFunction(tsFun.expression, variableName);
										}
									} else if (serverFunctionNames.includes(variableName)) {
										// @ts-expect-error ...
										checkFunction(declarator.init, variableName);
									}
								}
							});
						}
					}
				};
			}
		}
	}
};
