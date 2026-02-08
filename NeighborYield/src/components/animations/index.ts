/**
 * Animation components barrel export
 */

export {
  RadarRipple,
  createRippleRings,
  createRippleAnimation,
  createStaggeredAnimation,
  resetRings,
  createDirectionalHighlight,
  triggerDirectionalHighlight,
  createFadeOutAnimation,
  getAnimationConfig,
} from './RadarRipple';

export type {
  RadarRippleProps,
  RippleRing,
  AnimationConfig,
  DirectionalHighlight,
} from './RadarRipple';

export {
  ConnectionCelebration,
  createPulseRings,
  createPulseAnimation,
  resetPulseRings,
  isConnectionRestored,
  celebrationColors,
  useCelebration,
} from './ConnectionCelebration';

export type {
  ConnectionCelebrationProps,
  PulseRing,
  UseCelebrationResult,
} from './ConnectionCelebration';
