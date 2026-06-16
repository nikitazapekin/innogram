'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import styles from './Notifications.module.scss';
import {
  deleteNotification,
  getNotifications,
  markNotificationRead,
  type NotificationItem,
} from '@/app/shared/api/notifications';
import {
  getPendingFollowRequests,
  getProfile,
  getUserProfile,
  respondToFollowRequest,
  type FollowRequestDto,
  type ProfileDto,
} from '@/app/shared/api/users';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getProfileName(profile?: ProfileDto | null): string {
  return profile?.displayName || `Профиль #${profile?.id ?? '?'}`;
}

function MentionNotificationItem({
  notification,
  authorName,
  onRead,
  onDelete,
}: {
  notification: NotificationItem;
  authorName: string;
  onRead: () => void;
  onDelete: () => void;
}) {
  const payload = notification.payload ?? {};
  const sourceType = payload.sourceType === 'comment' ? 'комментарии' : 'посте';

  return (
    <article className={`${styles.item} ${notification.isRead ? styles.item_read : ''}`}>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>Упоминание</p>
        <p className={styles.itemText}>
          {authorName} упомянул вас в {sourceType}
        </p>
        <time className={styles.itemTime}>{formatDate(notification.createdAt)}</time>
      </div>
      <div className={styles.itemActions}>
        {!notification.isRead ? (
          <button className={styles.action} type="button" onClick={onRead}>
            Прочитано
          </button>
        ) : null}
        <button className={styles.action} type="button" onClick={onDelete}>
          Удалить
        </button>
      </div>
    </article>
  );
}

function SubscriptionNotificationItem({
  notification,
  followerName,
  onRead,
  onDelete,
}: {
  notification: NotificationItem;
  followerName: string;
  onRead: () => void;
  onDelete: () => void;
}) {
  return (
    <article className={`${styles.item} ${notification.isRead ? styles.item_read : ''}`}>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>Новая подписка</p>
        <p className={styles.itemText}>{followerName} подписался на вас</p>
        <time className={styles.itemTime}>{formatDate(notification.createdAt)}</time>
      </div>
      <div className={styles.itemActions}>
        <Link
          className={styles.action}
          href={`/profile/${notification.payload?.followerProfileId}`}
        >
          Профиль
        </Link>
        {!notification.isRead ? (
          <button className={styles.action} type="button" onClick={onRead}>
            Прочитано
          </button>
        ) : null}
        <button className={styles.action} type="button" onClick={onDelete}>
          Удалить
        </button>
      </div>
    </article>
  );
}

function FollowRequestItem({
  request,
  followerName,
  onRespond,
}: {
  request: FollowRequestDto;
  followerName: string;
  onRespond: (status: 'approved' | 'rejected') => void;
}) {
  return (
    <article className={styles.item}>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>Заявка в друзья</p>
        <p className={styles.itemText}>{followerName} хочет подписаться на вас</p>
        {request.createdAt ? (
          <time className={styles.itemTime}>{formatDate(request.createdAt)}</time>
        ) : null}
      </div>
      <div className={styles.itemActions}>
        <button
          className={`${styles.action} ${styles.action_primary}`}
          type="button"
          onClick={() => onRespond('approved')}
        >
          Принять
        </button>
        <button className={styles.action} type="button" onClick={() => onRespond('rejected')}>
          Отклонить
        </button>
      </div>
    </article>
  );
}

export function Notifications() {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const profileId = profile?.id;

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications', profileId],
    queryFn: () => getNotifications(profileId!),
    enabled: Boolean(profileId),
    refetchOnWindowFocus: true,
  });

  const { data: followRequests = [], isLoading: followRequestsLoading } = useQuery({
    queryKey: ['follow-requests', profileId],
    queryFn: () => getPendingFollowRequests(profileId!),
    enabled: Boolean(profileId),
    refetchOnWindowFocus: true,
  });

  const pendingRequestIds = new Set(followRequests.map((request) => request.id));
  const feedNotifications = notifications.filter((notification) => {
    if (notification.type !== 'follow_request') {
      return true;
    }

    const requestId = notification.payload?.followRequestId;

    return typeof requestId !== 'number' || !pendingRequestIds.has(requestId);
  });

  const profileIds = new Set<number>();

  for (const notification of notifications) {
    const payload = notification.payload ?? {};

    if (typeof payload.authorProfileId === 'number') {
      profileIds.add(payload.authorProfileId);
    }

    if (typeof payload.followerProfileId === 'number') {
      profileIds.add(payload.followerProfileId);
    }

    if (typeof payload.followRequestId === 'number') {
      // follower id already collected above for follow_request
    }
  }

  for (const request of followRequests) {
    profileIds.add(request.followerProfileId);
  }

  const { data: profilesById = {} } = useQuery({
    queryKey: ['notification-profiles', [...profileIds].sort().join(',')],
    queryFn: async () => {
      const entries = await Promise.all(
        [...profileIds].map(async (id) => {
          try {
            return [id, await getUserProfile(id)] as const;
          } catch {
            return [id, { id, displayName: `Профиль #${id}` }] as const;
          }
        }),
      );

      return Object.fromEntries(entries) as Record<number, ProfileDto>;
    },
    enabled: profileIds.size > 0,
  });

  const readMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => markNotificationRead(id, read),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', profileId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', profileId] }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: 'approved' | 'rejected' }) =>
      respondToFollowRequest(profileId!, requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-requests', profileId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', profileId] });
    },
  });

  if (!profileId) {
    return <p className={styles.empty}>Войдите, чтобы видеть уведомления.</p>;
  }

  const isLoading = notificationsLoading || followRequestsLoading;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Уведомления</h1>
        <p className={styles.subtitle}>Подписки, заявки в друзья и упоминания</p>
      </header>

      {isLoading ? <p className={styles.empty}>Загрузка...</p> : null}

      {!isLoading && followRequests.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Заявки в друзья</h2>
          <div className={styles.list}>
            {followRequests.map((request) => (
              <FollowRequestItem
                key={request.id}
                request={request}
                followerName={getProfileName(profilesById[request.followerProfileId])}
                onRespond={(status) => respondMutation.mutate({ requestId: request.id, status })}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Лента уведомлений</h2>
        {!isLoading && feedNotifications.length === 0 ? (
          <p className={styles.empty}>Пока нет уведомлений</p>
        ) : (
          <div className={styles.list}>
            {feedNotifications.map((notification) => {
              if (notification.type === 'mention') {
                const authorId = notification.payload?.authorProfileId;

                return (
                  <MentionNotificationItem
                    key={notification.id}
                    notification={notification}
                    authorName={getProfileName(
                      typeof authorId === 'number' ? profilesById[authorId] : undefined,
                    )}
                    onRead={() => readMutation.mutate({ id: notification.id, read: true })}
                    onDelete={() => deleteMutation.mutate(notification.id)}
                  />
                );
              }

              if (notification.type === 'user_subscribed') {
                const followerId = notification.payload?.followerProfileId;

                return (
                  <SubscriptionNotificationItem
                    key={notification.id}
                    notification={notification}
                    followerName={getProfileName(
                      typeof followerId === 'number' ? profilesById[followerId] : undefined,
                    )}
                    onRead={() => readMutation.mutate({ id: notification.id, read: true })}
                    onDelete={() => deleteMutation.mutate(notification.id)}
                  />
                );
              }

              if (notification.type === 'follow_request') {
                const followerId = notification.payload?.followerProfileId;
                const requestId = notification.payload?.followRequestId;

                if (typeof requestId !== 'number') {
                  return null;
                }

                return (
                  <FollowRequestItem
                    key={notification.id}
                    request={{
                      id: requestId,
                      followerProfileId: typeof followerId === 'number' ? followerId : 0,
                      followingProfileId: profileId!,
                      status: 'pending',
                    }}
                    followerName={getProfileName(
                      typeof followerId === 'number' ? profilesById[followerId] : undefined,
                    )}
                    onRespond={(status) => respondMutation.mutate({ requestId, status })}
                  />
                );
              }

              return (
                <article key={notification.id} className={styles.item}>
                  <div className={styles.itemBody}>
                    <p className={styles.itemTitle}>{notification.type}</p>
                    <p className={styles.itemText}>Новое уведомление</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
