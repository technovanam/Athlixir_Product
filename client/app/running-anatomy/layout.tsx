import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Running Leg Anatomy | Athlixir',
  description: 'Watch the muscles, bones and vessels of the leg move through a sprint stride.',
};

export default function RunningAnatomyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
