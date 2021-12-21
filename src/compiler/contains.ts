import { TransformApplication } from '../GlslSource';

export function contains(
  transformApplication: TransformApplication,
  transformApplications: TransformApplication[],
): boolean {
  for (let i = 0; i < transformApplications.length; i++) {
    if (transformApplication.name == transformApplications[i].name) {
      return true;
    }
  }
  return false;
}
