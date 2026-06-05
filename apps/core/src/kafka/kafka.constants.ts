export const USER_SUBSCRIBED_EVENT = 'user-subscribed';
export const MENTION_EVENT = 'mention';

export type UserSubscribedEventPayload = Readonly<{
  followerProfileId: number;
  followingProfileId: number;
}>;

export type MentionEventPayload = Readonly<{
  sourceType: 'post' | 'comment';
  sourceId: number;
  authorProfileId: number;
  mentionedProfileId: number;
}>;
