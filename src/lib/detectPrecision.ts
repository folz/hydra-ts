import { Precision } from '../Hydra';

type NavigatorLike = Pick<Navigator, 'platform' | 'maxTouchPoints'>;

/**
 * Replicates hydra-synth's default precision heuristic: 'highp' on iOS
 * devices (where mediump fragment shaders are visibly low-precision),
 * 'mediump' everywhere else.
 *
 * hydra-synth applies this automatically in its constructor; hydra-ts never
 * sniffs the environment implicitly, so opt in by passing the result:
 *
 *   new Hydra({ precision: detectPrecision(), ... })
 */
export function detectPrecision(nav?: NavigatorLike): Precision {
  const navigatorLike =
    nav ?? (typeof navigator !== 'undefined' ? navigator : undefined);

  if (navigatorLike === undefined) {
    return 'mediump';
  }

  const isIOS =
    (/iPad|iPhone|iPod/.test(navigatorLike.platform) ||
      // iPadOS reports MacIntel; the touch screen gives it away
      (navigatorLike.platform === 'MacIntel' &&
        navigatorLike.maxTouchPoints > 1)) &&
    !(
      typeof window !== 'undefined' &&
      (window as unknown as { MSStream?: unknown }).MSStream
    );

  return isIOS ? 'highp' : 'mediump';
}
