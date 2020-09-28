import { setLocale } from './errors-i18n/index';

setLocale('en');

export { setLocale };
export * from './shape';
export * from './validate';
export { ValidationError, BuiltInErrorMessages, setKeywordMessage, setStaticMessage } from './errors';
