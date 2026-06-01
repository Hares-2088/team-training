import Team from '@/models/Team';
import { getMemberRole } from '@/lib/utils/helpers';

export type TeamAccess = {
  team: {
    _id: string;
    trainer: string;
    members: string[];
    memberRoles: Array<{ user: string; role: string }>;
  };
  isTrainer: boolean;
  isCoach: boolean;
  isMember: boolean;
  canManage: boolean;
};

type TeamLike = {
  _id: unknown;
  trainer: unknown;
  members?: unknown[];
  memberRoles?: Array<{ user: unknown; role: string }>;
};

type ResourceLike = {
  createdBy?: unknown;
  isPersonal?: boolean;
  assignee?: unknown;
  assignedTo?: unknown;
};

export function stringifyId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return stringifyId((value as { _id: unknown })._id);
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    return String(value);
  }
  return String(value);
}

export function toSerializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getAccessFlags(team: TeamLike, userId: string): TeamAccess {
  const isTrainer = stringifyId(team.trainer) === userId;
  const memberRole = getMemberRole(
    {
      memberRoles: (team.memberRoles || []).map((member) => ({
        user: stringifyId(member.user),
        role: member.role,
      })),
    },
    userId
  );
  const members = (team.members || []).map((member) => stringifyId(member));
  const isMember = members.includes(userId);
  const isCoach = memberRole === 'coach';

  return {
    team: {
      _id: stringifyId(team._id),
      trainer: stringifyId(team.trainer),
      members,
      memberRoles: (team.memberRoles || []).map((member) => ({
        user: stringifyId(member.user),
        role: member.role,
      })),
    },
    isTrainer,
    isCoach,
    isMember,
    canManage: isTrainer || isCoach,
  };
}

export async function getTeamAccess(teamId: string, userId: string): Promise<TeamAccess | null> {
  const team = await Team.findById(teamId).select('trainer members memberRoles');
  if (!team) {
    return null;
  }

  const access = getAccessFlags(team.toObject(), userId);
  if (!access.isTrainer && !access.isCoach && !access.isMember) {
    return null;
  }

  return access;
}

export function canViewResource(
  resource: ResourceLike,
  userId: string,
  canManage: boolean,
  assignedField: 'assignee' | 'assignedTo'
): boolean {
  if (canManage) return true;
  if (stringifyId(resource.createdBy) === userId) return true;
  if (stringifyId(resource[assignedField]) === userId) return true;
  if (resource.isPersonal) return false;
  return !resource[assignedField];
}

export function buildVisibilityQuery(
  teamId: string,
  userId: string,
  canManage: boolean,
  assignedField: 'assignee' | 'assignedTo'
) {
  if (canManage) {
    return { team: teamId };
  }

  return {
    team: teamId,
    $or: [
      { createdBy: userId },
      { [assignedField]: userId },
      { isPersonal: { $ne: true }, [assignedField]: null },
      { isPersonal: { $ne: true }, [assignedField]: { $exists: false } },
    ],
  };
}
