import ndarray, { NdArray } from 'ndarray';
import type ORT from 'onnxruntime-web';
import * as ort_cpu from 'onnxruntime-web';
import * as ort_gpu from 'onnxruntime-web/webgpu';
import { getWebCanUse, setOrtEnv } from './utils';
import { getModel } from './model';

export type CanvasType = OffscreenCanvas | HTMLCanvasElement;

let sessionIsRunning = false;
let session: ORT.InferenceSession | null = null;

function getImageData(imageData: ImageData) {
  // return ndarray(new Uint8Array(imageData.data), [
  return ndarray(imageData.data, [imageData.height, imageData.width, 4]);
}

function resizeTensorBilinear(
  imageTensor: NdArray,
  newWidth: number,
  newHeight: number
) {
  const [originHeight, originWidth, originChannel] = imageTensor.shape;
  let scaleX = originWidth / newWidth;
  let scaleY = originHeight / newHeight;
  const resizedImageTensor = ndarray(
    new Uint8Array(originChannel * newWidth * newHeight),
    [newHeight, newWidth, originChannel]
  );
  for (let y2 = 0; y2 < newHeight; y2++) {
    for (let x2 = 0; x2 < newWidth; x2++) {
      const srcX = x2 * scaleX;
      const srcY = y2 * scaleY;
      const x1 = Math.max(Math.floor(srcX), 0);
      const x22 = Math.min(Math.ceil(srcX), originWidth - 1);
      const y1 = Math.max(Math.floor(srcY), 0);
      const y22 = Math.min(Math.ceil(srcY), originHeight - 1);
      const dx = srcX - x1;
      const dy = srcY - y1;
      for (let c2 = 0; c2 < originChannel; c2++) {
        const p1 = imageTensor.get(y1, x1, c2);
        const p2 = imageTensor.get(y1, x22, c2);
        const p3 = imageTensor.get(y22, x1, c2);
        const p4 = imageTensor.get(y22, x22, c2);
        const interpolatedValue =
          (1 - dx) * (1 - dy) * p1 +
          dx * (1 - dy) * p2 +
          (1 - dx) * dy * p3 +
          dx * dy * p4;
        resizedImageTensor.set(y2, x2, c2, interpolatedValue);
      }
    }
  }
  return resizedImageTensor;
}

function getBufferExtremum(imageBufferData: Uint8Array | Float32Array) {
  let max = 0;
  let min = 0;
  for (let i = 0; i < imageBufferData.length; i++) {
    const item = imageBufferData[i];
    if (item > max) {
      max = item;
    }
    if (item < min) {
      min = item;
    }
  }
  return [min, max];
}

function normMask(maskData: Float32Array) {
  const [min, max] = getBufferExtremum(maskData);
  const floatData = new Float32Array(maskData.length);
  for (let i = 0; i < maskData.length; i++) {
    floatData[i] = (maskData[i] - min) / (max - min);
  }
  return floatData;
}

function tensorHWCtoBCHW(
  imageTensor: ndarray.NdArray,
  mean = [0.485, 0.456, 0.406],
  std = [0.229, 0.224, 0.225]
) {
  const imageBufferData = imageTensor.data as Uint8Array;
  const [originHeight, originWidth] = imageTensor.shape;
  const stride = originHeight * originWidth;
  const float32Data = new Float32Array(3 * stride);
  const [_, max] = getBufferExtremum(imageBufferData);
  for (let i = 0, j = 0; i < imageBufferData.length; i += 4, j += 1) {
    float32Data[j] = (imageBufferData[i] / max - mean[0]) / std[0];
    float32Data[j + stride] = (imageBufferData[i + 1] / max - mean[1]) / std[1];
    float32Data[j + stride + stride] =
      (imageBufferData[i + 2] / max - mean[2]) / std[2];
  }
  return ndarray(float32Data, [1, 3, originHeight, originWidth]);
}

function float32ToUint8(float32Array: NdArray<Float32Array>) {
  const uint8Array = new Uint8Array(float32Array.data.length);
  for (let i = 0; i < float32Array.data.length; i++) {
    uint8Array[i] = float32Array.data[i] * 255;
  }
  return ndarray(uint8Array, float32Array.shape);
}

function imageToBlob(imageTensor: NdArray<Uint8ClampedArray>, quality = 0.8) {
  const [height, width] = imageTensor.shape;
  const imageData = new ImageData(
    new Uint8ClampedArray(imageTensor.data),
    width,
    height
  );

  const canvas = createCanvas(imageData.width, imageData.height) as CanvasType;
  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  ctx.putImageData(imageData, 0, 0);
  return (canvas as any).convertToBlob({
    quality,
    type: 'image/png',
  });
}

export function createCanvas(width: number, height: number) {
  let canvas: CanvasType;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
  }
  if (!canvas) {
    throw new Error(
      `Canvas nor OffscreenCanvas are available in the current context.`
    );
  }
  return canvas;
}

export async function initSession() {
  const webCanUse = await getWebCanUse();
  const ort = webCanUse.webGpu ? ort_gpu : ort_cpu;
  if (!session) {
    setOrtEnv(webCanUse, ort.env);
    console.time('sessionCreate');
    const modelBuffer = (await getModel()) as ArrayBuffer;
    session && (session as ORT.InferenceSession).release();
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: [webCanUse.webGpu ? 'webgpu' : 'wasm'],
      // executionProviders: ['wasm'],
      logSeverityLevel: 3,
    });
    console.log(
      'ORT executionProviders:',
      webCanUse.webGpu ? 'webgpu' : 'wasm'
    );
    console.timeEnd('sessionCreate');
  }
  return ort;
}

async function inference(canvasImageData: ImageData) {
  if (sessionIsRunning) {
    return;
  }
  sessionIsRunning = true;
  const ort = await initSession();
  console.time('sessionRun');
  const imageData = await getImageData(canvasImageData);
  const [originHeight, originWidth] = imageData.shape; // [536, 694, 4]
  const resolution = 320;
  const resizeTensor = resizeTensorBilinear(imageData, resolution, resolution);
  const input = tensorHWCtoBCHW(resizeTensor);
  const feeds = {
    [(session as ORT.InferenceSession).inputNames[0]]: new ort.Tensor(
      'float32',
      input.data,
      input.shape // [1, 3, 320, 320]
    ),
  };
  const output = await (session as ORT.InferenceSession).run(feeds);
  sessionIsRunning = false;
  const outputImage = output[(session as ORT.InferenceSession).outputNames[0]];

  // outputImage [1, 1, 320, 320]
  const outputMask = normMask(outputImage.data as Float32Array);
  const mask = ndarray(outputMask, [
    resolution,
    resolution,
    1,
  ]) as NdArray<Float32Array>;

  const maskUint8 = float32ToUint8(mask);
  const resizeMaskUint8 = resizeTensorBilinear(
    maskUint8,
    originWidth,
    originHeight
  );
  const stride = originWidth * originHeight;
  const outImageTensor = imageData;
  for (let i = 0; i < stride; i++) {
    outImageTensor.data[4 * i + 3] = resizeMaskUint8.data[i];
  }
  const outImage = await imageToBlob(outImageTensor);
  console.timeEnd('sessionRun');
  return outImage;
}

export default inference;
