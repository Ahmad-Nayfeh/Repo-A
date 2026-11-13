import { render } from 'preact';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import './styles.css';
import { App } from './app';
import { applyDocLang } from './i18n/i18n';

applyDocLang();
render(<App />, document.getElementById('app')!);
