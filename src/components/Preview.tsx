import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import {
  ReactCompareSlider,
  UseReactCompareSliderRefReturn,
} from 'react-compare-slider';
import Background from './Backgound';
import * as m from '../paraglide/messages';
import inference, {
  createCanvas,
  CanvasType,
} from '../assets/script/inference';

interface PreviewComponentProps {
  originUrl: string;
  originName: string;
  onClick: (type: 'delete') => void;
}

let originWidth: number;
let originHeight: number;
let handledImgBgColor: string = '';

const calcCanvasShape: (w: number, h: number) => [number, number] = (w, h) => {
  let canvasWidth: number;
  let canvasHeight: number;
  if (w < h) {
    canvasHeight = Math.floor(Math.min(window.innerHeight * 0.7, h));
    canvasWidth = Math.floor((canvasHeight * w) / h);
  } else {
    canvasWidth = Math.floor(Math.min(window.innerWidth * 0.6, w));
    canvasHeight = Math.floor((canvasWidth * h) / w);
  }
  return [canvasWidth, canvasHeight];
};

const downloadImage = (handledImgUrl: string, name: string) => {
  let canvas: CanvasType | null = createCanvas(
    originWidth,
    originHeight
  ) as CanvasType;
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  const img = new Image();
  img.onload = async () => {
    if (
      handledImgBgColor &&
      (handledImgBgColor.indexOf('#') > -1 ||
        handledImgBgColor === 'transparent')
    ) {
      ctx.fillStyle = handledImgBgColor;
      ctx.fillRect(0, 0, originWidth, originHeight);
    }
    ctx.drawImage(img, 0, 0, originWidth, originHeight);
    const imageBlob = await (canvas as any).convertToBlob({
      quality: 0.8,
      type: 'image/png',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(imageBlob);
    link.download = `${name}_rbg.png`;

    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    setTimeout(() => {
      link.remove();
      canvas = null;
    }, 100);
  };
  img.src = handledImgUrl;
};

const Preview: React.FC<PreviewComponentProps> = ({
  originUrl,
  originName,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reactCompareSliderRef = useRef<UseReactCompareSliderRefReturn>(null);
  const [sliderWidth, setSliderWidth] = useState('60vw');
  const [sliderHeight, setSliderHeight] = useState('60vw');
  const [handledUrl, setHandledUrl] = useState('');
  const [showMask, setShowMask] = useState(false);
  let ctx: CanvasRenderingContext2D | null = null;

  const fireTransition = async () => {
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          reactCompareSliderRef.current?.setPosition(90);
          resolve(true);
        }, 750);
      })
    );
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          reactCompareSliderRef.current?.setPosition(10);
          resolve(true);
        }, 750);
      })
    );
    await new Promise((resolve) =>
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          reactCompareSliderRef.current?.setPosition(50);
          resolve(true);
        }, 750);
      })
    );
  };

  useEffect(() => {
    if (canvasRef.current) {
      ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    }
  }, []);

  useEffect(() => {
    setShowMask(true);
    // origin image
    draw(originUrl);

    // handle image
    inference(originUrl).then((res) => {
      if (!res) return;
      const blobURL = URL.createObjectURL(res);
      draw(blobURL);
      setShowMask(false);
      setHandledUrl(blobURL);
      fireTransition();
    });
  }, [originUrl]);

  const draw = (dataUrl: string, background: string = '') => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && dataUrl) {
      ctx.clearRect(
        0,
        0,
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      );

      const img = new Image();
      img.onload = async () => {
        let width = 0;
        let height = 0;
        if (canvasRef.current?.width && canvasRef.current?.height) {
          width = canvasRef.current?.width;
          height = canvasRef.current?.height;
        } else {
          if (canvasRef.current) {
            originWidth = img.width;
            originHeight = img.height;
            [width = 0, height = 0] = calcCanvasShape(
              originWidth,
              originHeight
            );
          }
        }
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          setSliderWidth(`${width}px`);
          setSliderHeight(`${height}px`);
        }
        if (
          background &&
          (background.indexOf('#') > -1 || background === 'transparent')
        ) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = dataUrl;
    }
  };

  const handleChangeBg = (backgroundColor: string) => {
    reactCompareSliderRef.current?.setPosition(0);
    handledImgBgColor = backgroundColor;
    draw(handledUrl, backgroundColor);
  };

  const downloadHandledImage = () => {
    downloadImage(handledUrl, originName);
  };

  return (
    <div
      className='flex py-16'
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className='flex m-auto items-center'>
        <ReactCompareSlider
          ref={reactCompareSliderRef}
          itemOne={
            <img
              src={originUrl}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          }
          itemTwo={
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                border: '2px solid rgba(69, 69, 69, 0.3)',
                borderRadius: '6px',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
                backgroundColor: 'white',
                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
              linear-gradient(-45deg, #ccc 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ccc 75%),
              linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
              }}
            />
          }
          style={{
            width: sliderWidth,
            height: sliderHeight,
            overflow: 'hidden',
          }}
        />

        <div
          className='flex flex-wrap justify-between items-center'
          style={{
            width: '304px',
            paddingLeft: '12px',
          }}
        >
          <Background onChangeBg={handleChangeBg} />
          <div className='mt-5'>
            <Button
              className='w-64 mb-3'
              color='primary'
              size='lg'
              onClick={downloadHandledImage}
            >
              {m.download()}
            </Button>
            <Button
              className='w-64'
              color='danger'
              size='lg'
              onClick={() => onClick('delete')}
            >
              {m.delete_result()}
            </Button>
          </div>
        </div>

        {showMask && (
          <div className='flex absolute w-full h-full rounded-xl bg-sky-600 text-5xl text-warning-300 bg-opacity-80 justify-center items-center'>
            {m.processing_image()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
