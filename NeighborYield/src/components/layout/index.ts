/**
 * Layout components barrel export
 */

export { BentoGrid, calculateCardDimensions, assignCardSize, numericToPriority } from './BentoGrid';

export type {
  BentoGridProps,
  BentoGridItem,
  CardSize,
  CardDimensions,
  Priority,
} from './BentoGrid';

export {
  GradientHeader,
  getGradientColorsForMode,
  abundanceGradientColors,
  survivalGradientColors,
} from './GradientHeader';

export type { GradientHeaderProps, GradientColors } from './GradientHeader';
