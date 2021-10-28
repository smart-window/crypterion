const _ = require('lodash');
const lessSyntax = require('postcss-less');
const path = require('path');
const less = require('less');
const chalk = require('chalk');
const postcss = require('postcss');
const fs = require('fs');


class LessThemePlugin {
	constructor(options) {
		const defaultOptions = {
			mixinFiles     : [],
			themeVariables : ["@primary-color"],
			colorProps     : [
				'color',
				'box-shadow',
				'background',
				'border',
			]
		};

		if (!options) options = {};

		if (!options.source || !options.output) {
			throw new Error('You need to specify source and output path!')
		}

		this.options = _.assign(
			{}, defaultOptions, options
		);
	}

	filterColorProps() {
		const {colorProps} = this.options;
		const props = colorProps.join('|');

		return postcss.plugin(
			"filterColorProps", () => {
				const cleanRule = rule => {
					let removeRule = true;

					const regex1 = RegExp("^(?!" + props + ").*");
					rule.walkDecls(regex1, decl => {
						decl.remove()
					});

					const regex2 = RegExp("^(?:" + props + ").*");
					rule.walkDecls(regex2, decl => {
						// if (
						// 	!/(@[\w\-_]+)/g.test(decl.value) &&
						// 	!/transparent/g.test(decl.value) &&
						// 	decl.value !== 'none'
						// ) {
						// 	decl.remove();
						// } else {
						// 	removeRule = false;
						// }
						removeRule = false;
					});

					if (removeRule) rule.remove();
				};
				return css => {
					css.walkAtRules(r => r.remove());
					css.walkRules(cleanRule);
					css.walkComments(c => c.remove());
				};
			});
	};

	getVariables(lessFile) {
		const regex = /([\s;])(?:(@[\w_\-]+)\s*?:\s*([^\n\f\v]+[^;\n\f\v])(?=\s*[;]))/g;
		let variables = {}, match;
		const paths = this.options.themeVariables;

		while ((match = regex.exec(lessFile)) !== null) {
			variables[match[2]] = match[3];
		}

		const rootVariables = _.pick(variables, paths);
		return _.assign(rootVariables, this.getDependentVariables(variables, rootVariables));
	}

	escapeVariablesUsage(lessFile, palette) {
		const {colorProps} = this.options;
		const props = colorProps.join('|');

		const regex = new RegExp("([\\s{;])\\b(?:((?:" + props + ")[\\w-]*)\\s*?:\\s*([^\\n\\f\\v]+[^;}\\n\\f\\v])(?=\\s*[;}]))", 'g');

		return lessFile.replace(regex, function (match, prefix, prop, value) {
			const search = _.keys(palette).join('|');
			let skip = false, matchVars;

			const regex1 = new RegExp("(?:" + search + ")(?![\\w\\-\\_])", 'g');

			// Match variables that contain mixins. We are not interested!
			const regex2 = /(?:\.\w[\w-_]+\(.*\))/g;
			if (!(regex1.test(value) && !regex2.test(value))) skip = true;

			if (!skip) {
				const regex3 = /@{([\w\-_]+)}/g;
				while ((matchVars = regex3.exec(value)) !== null) {
					let matchedVar = '@' + matchVars[1];
					if (typeof palette[matchedVar] === "undefined") {
						// console.warn(
						// 	'\n The variable ' + chalk.white(matchedVar) + ' was not ' +
						// 	'included in themeVariables. Skipping the line: \n' + match
						// );
						skip = true;
					}
				}

				const regex4 = /(@[\w\-_]+)/g;
				while ((matchVars = regex4.exec(value)) !== null) {
					let matchedVar = matchVars[0];
					if (typeof palette[matchedVar] === "undefined") {
						// console.warn(
						// 	'\n The variable ' + chalk.white(matchedVar) + ' was not ' +
						// 	'included in themeVariables. Skipping the line: \n' + match
						// );
						skip = true;
					}
				}
			}
			if (skip) return match;

			return prefix + prop + ': ~"' + value + '"';
		});
	}

	process(lessFile) {
		const filterColorProps = this.filterColorProps();
		const palette = this.getVariables(lessFile);
		lessFile = this.escapeVariablesUsage(lessFile, palette);
		const {source} = this.options;

		let variables = "";

		return new Promise(function (resolve, reject) {
			less.render(lessFile, function (e, r) {
				if (e) return reject(e);
				const css = r.css;

				postcss([filterColorProps])
					.process(css, {
						syntax : lessSyntax,
						from   : source,
					})
					.then(result => {
						_.forEach(palette, function (value, key) {
							variables += key + ": " + value + "; \n"
						});

						resolve([variables, result.css].join('\n'));
					})
					.catch(err => {
						reject(err)
					});
			});
		});
	}

	convertToInterpolated(variables) {
		return _.mapKeys(variables, function (value, key) {
			return "@{" + key.substr(1) + "}";
		});
	}

	getDependentVariables(variables, parent) {
		let dependentVariables = {};

		const interpolatedVariableNames = _.keys(this.convertToInterpolated(parent)).join('|');
		const variableNames = _.keys(parent).join('|');


		_.forIn(variables, function (value, key) {
			// Match mixins used as functions.
			const regex1 = /(?:\.\w[\w\-_]+\(.*\))/g;

			// Match any variable that is composed of interpolated parent variable
			const regex2 = new RegExp("(?:" + interpolatedVariableNames + ")(?![\\w\\-\\_])", 'g');


			// Match any variable that is composed of any of the parent variable
			const regex3 = new RegExp("(?:" + variableNames + ")(?![\\w\\-\\_])", 'g');

			if ((regex3.test(value) || regex2.test(value)) && !regex1.test(value)) dependentVariables[key] = value;
		});

		if (_.keys(dependentVariables).length > 0) {
			dependentVariables = _.assign(
				dependentVariables, this.getDependentVariables(variables, dependentVariables)
			)
		}
		return dependentVariables;
	}

	writeLines(output, outputLines) {
		return output + outputLines.join("\n") + "\n";
	}

	buildLessFile(lines, filePath, manifest = {}, output = "", plugins = {}) {
		const context = path.dirname(filePath);
		let localManifest = _.assign({}, manifest), outputLines = [];

		localManifest[filePath] = filePath;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			if (line.indexOf('@import ') === 0) {
				if (outputLines.length > 0) output = this.writeLines(output, outputLines);

				let importFile = line.replace(/.*(?:'|")(.*)(?:'|").*/, '$1');

				if (!(path.extname(importFile).length > 1)) importFile += '.less';

				let result;
				if (importFile.charAt(0) !== '~') {
					result = path.resolve(context, importFile);
				} else {
					result = path.resolve(process.cwd(), "node_modules", importFile.substr(1));
				}

				if (typeof localManifest[result] === "undefined") {
					let content = fs.readFileSync(result, 'utf8');
					const builtFile = this.buildLessFile(
						content.trim().split(/\r\n|\n/), result, localManifest, output
					);
					plugins = _.assign(plugins, builtFile.plugins);
					localManifest = _.assign(localManifest, builtFile.manifest);
					output = builtFile.output;
				}

				outputLines = [];
			} else if (line.indexOf('@plugin ') === 0) {
				let pluginFile = line.replace(/.*(?:'|")(.*)(?:'|").*/, '$1');

				if (!(path.extname(pluginFile).length > 1)) pluginFile += '.js';

				let result;
				if (pluginFile.charAt(0) !== '~') {
					result = path.resolve(context, pluginFile);
				} else {
					result = path.resolve(process.cwd(), "node_modules", pluginFile.substr(1));
				}

				plugins[result] = result;
			} else {
				outputLines.push(lines[i]);
			}
		}

		if (outputLines.length > 0) {
			output = this.writeLines(output, outputLines);
		}

		return {manifest : localManifest, output, plugins};
	}

	apply(compiler) {
		const buildLessFile = this.buildLessFile.bind(this);
		const {source, output, mixinFiles} = this.options;

		compiler.hooks.emit.tapAsync(
			'LessThemePlugin', (compilation, callback) => {
				const sourceFile = fs.readFileSync(source, 'utf8');
				const sourceLines = sourceFile.trim().split(/\r\n|\n/);

				let mixinOutput = "", mixinManifest = {}, mixinPlugins = {};

				mixinFiles.forEach(function (path) {
					let mixinFile = fs.readFileSync(path, 'utf8');
					let mixinLines = mixinFile.trim().split(/\r\n|\n/);

					let builtMixin = buildLessFile(
						mixinLines, path, mixinManifest, mixinOutput, mixinPlugins
					);

					mixinPlugins = builtMixin.plugins;
					mixinOutput = builtMixin.output;
					mixinManifest = builtMixin.manifest;
				});

				const builtFile = buildLessFile(sourceLines, source);

				// TODO: Build the plugin into a file under the same directory
				// TODO: with the output, and reference it at the top of the output
				// console.log(builtFile.plugins);

				this.process(builtFile.output)
					.then(function (result) {
						const file = [mixinOutput, result].join("\n");

						compilation.assets[output] = {
							source : () => file,
							size   : () => file.length
						};

						callback();
					})
					.catch(function (error) {
						callback(error);
					});
			});
	}
}

module.exports = LessThemePlugin;