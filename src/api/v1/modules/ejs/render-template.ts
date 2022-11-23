import * as ejs from 'ejs';
import * as fs from 'fs';
import * as R from 'ramda';

export const renderTemplate = R.curry(
  (templatePath, variablesToInject) => {
    const file = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    const template = ejs.render(file, variablesToInject);
    return template;
  },
);
