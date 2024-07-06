import type ORT from 'onnxruntime-web';
import { WASM_PATH } from './config';

interface DownloadParams {
  url: string;
  progress: (loaded: number, total: number) => void;
  finalCb: (flag: boolean, data: Error | ArrayBuffer) => void;
}

interface IWebCanUse {
  webGpu: boolean;
  wasm: boolean;
  simd: boolean;
  threads: boolean;
}

export function downloadFile({ url, progress, finalCb }: DownloadParams) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.status + ' ' + response.statusText);
      }

      if (!response.body) {
        throw Error('ReadableStream not yet supported in this browser.');
      }

      // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
      // server must send custom x-file-size header if gzip or other content-encoding is used
      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get(
        contentEncoding ? 'x-file-size' : 'content-length'
      );
      if (contentLength === null) {
        throw Error('Response size header unavailable');
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      return new Response(
        new ReadableStream({
          start(controller) {
            const reader = (
              response.body as ReadableStream<Uint8Array>
            ).getReader();

            read();
            function read() {
              reader
                .read()
                .then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  loaded += value.byteLength;
                  progress(loaded, total);
                  controller.enqueue(value);
                  read();
                })
                .catch((error) => {
                  console.error(error);
                  controller.error(error);
                });
            }
          },
        })
      );
    })
    .then((response) => response.arrayBuffer())
    .then((res) => {
      finalCb(true, res);
    })
    .catch((error) => {
      finalCb(false, error);
    });
}

const checkWebGpu = async () => {
  if (!navigator.gpu) {
    return false;
  }
  return !!(await navigator.gpu.requestAdapter());
};

const checkWasm = () =>
  typeof WebAssembly === 'object' &&
  typeof WebAssembly.instantiate === 'function';

const checkSimd = async () =>
  WebAssembly.validate(
    new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
      1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
    ])
  );

const checkThreads = () =>
  (async (e) => {
    try {
      return (
        typeof MessageChannel !== 'undefined' &&
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),
        WebAssembly.validate(e)
      );
    } catch (error) {
      return !1;
    }
  })(
    new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1,
      1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11,
    ])
  );

export const getWebCanUse = async (): Promise<IWebCanUse> => {
  return {
    webGpu: await checkWebGpu(),
    wasm: checkWasm(),
    simd: await checkSimd(),
    threads: await checkThreads(),
  };
};

export const setOrtEnv = (webCanUse: IWebCanUse, env: ORT.Env) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('ORT DEV MODE:', webCanUse);
    env.debug = true;
    env.logLevel = 'error';
  }
  const { webGpu, simd, threads } = webCanUse;
  /* const wasmPaths = {
    'ort-wasm-simd-threaded.wasm': threads && simd,
    'ort-wasm-simd.wasm': !threads && simd,
    'ort-wasm-threaded.wasm': !webGpu && threads && !simd,
    'ort-wasm.wasm': !webGpu && !threads && !simd,
  }; */
  env.wasm.wasmPaths = WASM_PATH;
  const device = webGpu ? 'gpu' : 'cpu';
  env.wasm.proxy = true;
  if (device === 'cpu') {
    if (threads) {
      env.wasm.numThreads = navigator.hardwareConcurrency ?? 4;
    }
    env.wasm.simd = simd;
  } else if (device === 'gpu') {
    env.wasm.numThreads = 1;
  }
};
