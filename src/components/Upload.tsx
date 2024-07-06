import React, { useState, useRef, DragEvent } from 'react';
import { Button } from '@nextui-org/react';
import corner from '../assets/img/corner.svg';
import * as m from '../paraglide/messages';

interface FileListState {
  files: File[];
  previewImage?: string;
}

interface UploadComponentProps {
  onFileChange: (dataUrl: string, imgName: string) => void;
}

const exampleImages = [
  '/example/girl.jpg',
  '/example/car.jpg',
  '/example/horse.jpg',
  '/example/plant.jpg',
];

const DragDropUpload: React.FC<UploadComponentProps> = ({ onFileChange }) => {
  /* const [uploadedFiles, setUploadedFiles] = useState<FileListState>({
    files: [],
    previewImage: undefined,
  }); */
  const [dragging, setDragging] = useState<boolean>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectedImage = (files: FileList | File[]) => {
    if (files && files.length > 0) {
      const fileArray: File[] = [];
      for (let i = 0; i < files.length; i++) {
        fileArray.push(files[i]);
      }
      const nameArr = fileArray[0].name.split('.');
      nameArr.pop();
      const imageName = nameArr.join('.');
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          /* setUploadedFiles((prevFiles) => ({
            files: [...prevFiles.files, ...fileArray],
            previewImage: e.target?.result as string,
          })); */
          onFileChange(e.target?.result as string, imageName);
        }
      };
      reader.readAsDataURL(fileArray[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    handleSelectedImage(event.dataTransfer?.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    if (!dragging) setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragging) setDragging(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files) {
      handleSelectedImage(event.target.files);
    }
  };
  const handleExample = async (uri: string) => {
    const imgBlob = await fetch(uri).then((r) => r.blob());
    handleSelectedImage([
      new File([imgBlob], uri.replace('/example/', ''), { type: 'image/jpg' }),
    ]);
  };
  return (
    <div
      ref={dropZoneRef}
      className='drop-zone fixed w-screen h-screen'
      style={{ backgroundColor: dragging ? 'rgba(125, 211, 252, 0.6)' : '' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className='left-1/2 top-1/3 absolute text-4xl'
        style={{
          transform: 'translateX(-50%)',
        }}
      >
        <div>{m.drop_an_image()}</div>
        <input ref={inputRef} type='file' onChange={handleFileChange} hidden />
        <Button
          className='mt-6'
          color='primary'
          size='lg'
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {m.upload_image()}
        </Button>
        <div className='pt-20 text-base text-gray-600'>
          {m.try_one()}
          <ul className='pt-2 flex justify-center'>
            {exampleImages.map((item) => (
              <li
                className='mr-1 rounded overflow-hidden cursor-pointer'
                key={item}
                onClick={() => handleExample(item)}
              >
                <img className='w-16 h-16' src={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DragOver UI */}
      {dragging && (
        <div className='opacity-60'>
          <img className='left-8 top-8 absolute' src={corner} />
          <img className='right-8 top-8 absolute rotate-90' src={corner} />
          <img
            className='left-8 bottom-8 absolute'
            src={corner}
            style={{ transform: 'rotate(270deg)' }}
          />
          <img className='right-8 bottom-8 absolute rotate-180' src={corner} />
          <h1
            className='absolute text-3xl text-white font-bold left-1/2 top-1/2 translate-x-1/2 translate-y-1/2'
            style={{
              transform: 'translateX(-50%)',
            }}
          >
            {m.drop_anywhere()}
          </h1>
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;
