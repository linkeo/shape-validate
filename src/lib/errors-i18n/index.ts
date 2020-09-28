import { BuiltInErrorMessages, setLocaleMessages } from '../errors';
import en from './en';
import zhCN from './zh-CN';

type BuiltinLocale = 'en' | 'zh-CN';
const locales: Record<BuiltinLocale, BuiltInErrorMessages> = {
  en,
  'zh-CN': zhCN,
};
export function setLocale(locale: BuiltinLocale): void {
  setLocaleMessages(locales[locale]);
}
