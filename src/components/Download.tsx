import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from '@nextui-org/react';
import { downloadFile } from '../assets/script/utils';
import { getModel, setModel } from '../assets/script/model';
import { MODEL_URL } from '../assets/script/config';
import * as m from '../paraglide/messages';
import { initSession } from '../assets/script/inference';

interface DownloadComponentProps {}
const Download: React.FC<DownloadComponentProps> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [progress, setProgress] = useState(0);
  const [downloadFailed, setDownloadFailed] = useState(false);

  useEffect(() => {
    async function setModelData() {
      const modelBuffer: ArrayBuffer | null = await getModel();
      if (!modelBuffer) {
        onOpen();
        downloadFile({
          url: MODEL_URL,
          progress: (loaded, total) => {
            const res = Math.round((loaded / total) * 100);
            setProgress(res);
          },
          finalCb: (flag, data) => {
            if (flag === true) {
              console.log('download model successfully');
              setModel(data as ArrayBuffer);
              onClose();
              initSession();
            } else {
              // download failed
              setDownloadFailed(true);
            }
          },
        });
      } else {
        initSession();
      }
    }
    setModelData();
  }, []);

  return (
    <>
      <Modal backdrop='blur' isOpen={isOpen} hideCloseButton={true} size='xl'>
        <ModalContent>
          <ModalHeader className='flex flex-col gap-1'>{m.notes()}</ModalHeader>
          <ModalBody>
            <div className='pb-4'>
              {!downloadFailed && (
                <div className='pb-2'>{m.download_model_message()}</div>
              )}
              {downloadFailed && (
                <div className='text-red-600 pb-2'>{m.download_failed()}</div>
              )}
              <progress max='100' value={progress}></progress>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Download;
