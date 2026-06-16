export type RelationshipStatus = 'none' | 'following' | 'requested';

export class RelationshipDto {
  status: RelationshipStatus;
}
