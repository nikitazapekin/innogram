import { UserProfile } from '@/app/widgets/user-profile';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <UserProfile userId={Number(id)} />;
}
