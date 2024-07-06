import React, { useState } from 'react';
import logo from '../assets/img/logo.svg';
import github from '../assets/img/github.svg';
import githubPrimary from '../assets/img/github_primary.svg';
import {
  languageTag,
  onSetLanguageTag,
  setLanguageTag,
} from '../paraglide/runtime';
import { Language } from '../App';

interface HeadComponentProps {
  onLanguageChange: (newValue: Language) => void;
}

const Head: React.FC<HeadComponentProps> = ({ onLanguageChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  onSetLanguageTag(() => {
    onLanguageChange(languageTag());
  });
  const changeLanguage = (tag: Language) => {
    setLanguageTag(tag);
  };

  return (
    <nav
      className='w-screen fixed text-base p-5 flex justify-between z-10'
      style={{
        height: '4rem',
        boxShadow: '0px 0px 4px rgba(14, 19, 24, .07)',
      }}
    >
      <div className='flex flex-row'>
        <img className='w-8 mt-1' src={logo} />
        <div className='pl-3 font-bold cursor-default'>
          <span className='text-primary'>REMOVE</span>-
          <span className='text-gray-300'>BG</span>
        </div>
      </div>
      <ul className='flex justify-around'>
        <li
          className='cursor-pointer px-2 hover:text-primary hover:font-bold'
          onClick={() => changeLanguage(languageTag() === 'zh' ? 'en' : 'zh')}
        >
          {languageTag() === 'zh' ? 'en' : '中文'}
        </li>
        <li className='px-2 ml-2'>
          <a
            className='inline-block'
            href='https://github.com/reamd/remove-bg'
            target='_blank'
          >
            <img
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className='hover:text-primary'
              src={isHovered ? githubPrimary : github}
            />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Head;
