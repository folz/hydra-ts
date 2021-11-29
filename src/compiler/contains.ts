import { TransformApplication } from '../GlslSource';

export function contains(
  object: TransformApplication,
  arr: TransformApplication[],
): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (object.name == arr[i].name) {
      return true;
    }
  }
  return false;
}
