import { createContext } from 'react';
import { sourceLanguageTag } from '../paraglide/runtime';
import { Language } from '../App';

export const LanguageContext = createContext<Language>(sourceLanguageTag);
