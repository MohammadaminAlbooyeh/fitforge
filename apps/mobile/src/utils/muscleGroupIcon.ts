import { Ionicons } from '@expo/vector-icons';

type MuscleGroupVisual = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
};

const VISUALS: Record<string, MuscleGroupVisual> = {
  chest: { icon: 'body-outline', color: '#FF7A50', label: 'Chest' },
  back: { icon: 'body', color: '#5E3DE0', label: 'Back' },
  shoulders: { icon: 'triangle-outline', color: '#3DD598', label: 'Shoulders' },
  biceps: { icon: 'barbell-outline', color: '#FF5A7A', label: 'Biceps' },
  triceps: { icon: 'barbell', color: '#7C5CFC', label: 'Triceps' },
  forearms: { icon: 'hand-left-outline', color: '#F5A623', label: 'Forearms' },
  quads: { icon: 'walk-outline', color: '#3DA5D9', label: 'Quads' },
  hamstrings: { icon: 'footsteps-outline', color: '#2E9E7B', label: 'Hamstrings' },
  glutes: { icon: 'ellipse-outline', color: '#D9527A', label: 'Glutes' },
  calves: { icon: 'chevron-up-outline', color: '#E07A3F', label: 'Calves' },
  core: { icon: 'sync-outline', color: '#8B5CF6', label: 'Core' },
  legs: { icon: 'walk-outline', color: '#3DA5D9', label: 'Legs' },
  arms: { icon: 'barbell-outline', color: '#FF5A7A', label: 'Arms' },
};

const FALLBACK: MuscleGroupVisual = { icon: 'fitness-outline', color: '#8B889C', label: 'Exercise' };

export function getMuscleGroupVisual(muscleGroup?: string | null): MuscleGroupVisual {
  if (!muscleGroup) return FALLBACK;
  return VISUALS[muscleGroup] ?? FALLBACK;
}
