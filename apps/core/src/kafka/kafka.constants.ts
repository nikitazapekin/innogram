export const USER_SUBSCRIBED_EVENT = 'user-subscribed';

export type UserSubscribedEventPayload = Readonly<{
  followerProfileId: number;
  followingProfileId: number;
}>;
