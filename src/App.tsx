import { useState } from 'react';
import { NextUIProvider } from '@nextui-org/react';
import './App.css';
import Head from './components/Head';
import Upload from './components/Upload';
import Preview from './components/Preview';
import Download from './components/Download';
import { LanguageContext } from './contexts/Context';
import { sourceLanguageTag } from './paraglide/runtime';

export type Language = 'zh' | 'en';

function App() {
  const [language, setLanguage] = useState<Language>(sourceLanguageTag);
  const [showUpload, setShowUpload] = useState(true);
  const [originImage, setOriginImage] = useState<string>('');
  const [originImageName, setOriginImageName] = useState<string>('');

  const handleLanguageChange = (tag: Language) => {
    setLanguage(tag);
  };
  const handleFileChange = (dataUrl: string, imgName: string) => {
    setOriginImage(dataUrl);
    setOriginImageName(imgName);
    setShowUpload(false);
  };
  const handlePreviewClick = (type: 'delete') => {
    if (type === 'delete') {
      setShowUpload(true);
    }
  };

  return (
    <NextUIProvider>
      <LanguageContext.Provider value={language}>
        <div className='App'>
          {/* header */}
          <Head onLanguageChange={handleLanguageChange} />

          {/* download model */}
          <Download />

          {showUpload && <Upload onFileChange={handleFileChange} />}

          {!showUpload && (
            <Preview
              originUrl={originImage}
              originName={originImageName}
              onClick={handlePreviewClick}
            />
          )}
        </div>
      </LanguageContext.Provider>
    </NextUIProvider>
  );
}

export default App;
