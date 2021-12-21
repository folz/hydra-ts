import { TransformApplication } from '../GlslSource';

export function contains(
  transformApplication: TransformApplication,
  transformApplications: TransformApplication[],
): boolean {
  for (let i = 0; i < transformApplications.length; i++) {
    if (
      transformApplication.transform.name ==
      transformApplications[i].transform.name
    ) {
      return true;
    }
  }
  return false;
}
