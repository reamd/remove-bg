import localforage from 'localforage';
import { MODEL_NAME } from './config';

localforage.config({
  name: 'modelStore',
});

export async function setModel(modelBlob: ArrayBuffer) {
  await localforage.setItem(MODEL_NAME, modelBlob);
}

export async function getModel(): Promise<ArrayBuffer | null> {
  const model = (await localforage.getItem(MODEL_NAME)) as ArrayBuffer | null;
  return model;
}
