import { redirect } from 'next/navigation';

export default function DashboardBiomechanicsPage() {
  redirect('/dashboard?tab=biomechanics');
}
