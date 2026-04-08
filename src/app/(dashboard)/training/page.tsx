import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import TrainingClient from './TrainingClient';

export const metadata: Metadata = {
  title: 'Modeling',
  description: 'Train model machine learning.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TrainingPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <TrainingClient user={user} />;
}
