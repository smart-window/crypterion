const path = require('path');
const fs = require('fs');
const globSync = require('glob').sync;
const mkdirp = require('mkdirp');

const LANG_DIR = path.join(__dirname, 'resources/lang');
const MESSAGES_PATTERN = path.join(__dirname, 'resources/messages/**/*.json');

// Aggregates the default messages that were extracted from the example app's
// React components via the React Intl Babel plugin. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.
let messages = globSync(MESSAGES_PATTERN)
	.map(filename => fs.readFileSync(filename))
	.map(file => JSON.parse(file.toString()))
	.reduce((collection, descriptors) => {
		descriptors.forEach(({id, defaultMessage}) => {
			if (collection.hasOwnProperty(id)) {
				if(defaultMessage !== collection[id]){
					throw new Error(`Duplicate message id: ${id}`);
				}
			}
			collection[id] = defaultMessage;
		});
		return collection;
	}, {});

mkdirp.sync(LANG_DIR);

fs.writeFileSync(
	path.join(LANG_DIR, 'en.json'),
	JSON.stringify(messages, null, '\t')
);