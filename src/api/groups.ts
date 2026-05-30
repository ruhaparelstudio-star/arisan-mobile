import { apiCall } from './client';

export interface Group {
  id: string;
  name: string;
  nominal: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  total_periods: number;
  draw_mode: 'random' | 'fixed' | 'offline';
  invite_code: string;
  status: 'recruiting' | 'active' | 'completed';
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  slot_order: number | null;
  joined_at: string;
  user: { name: string | null; phone: string };
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  current_period: number;
}

export function getMyGroups(token: string): Promise<Group[]> {
  return apiCall('/api/groups', { token });
}

export function getGroupDetail(token: string, groupId: string): Promise<GroupDetail> {
  return apiCall(`/api/groups/${groupId}`, { token });
}

export function createGroup(
  token: string,
  data: {
    name: string;
    nominal: number;
    frequency: string;
    total_periods: number;
    draw_mode: string;
  },
): Promise<Group> {
  return apiCall('/api/groups', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export function joinGroup(token: string, invite_code: string): Promise<{ message: string; group: Group }> {
  return apiCall('/api/groups/join', {
    method: 'POST',
    body: JSON.stringify({ invite_code }),
    token,
  });
}

export function getGroupByCode(token: string, invite_code: string): Promise<Group & { member_count: number }> {
  return apiCall(`/api/groups/code/${invite_code}`, { token });
}

export function leaveGroup(token: string, groupId: string): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/leave`, {
    method: 'POST',
    token,
  });
}

export function generateInvite(token: string, groupId: string): Promise<{ invite_code: string }> {
  return apiCall(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    token,
  });
}

export function setSlotOrder(
  token: string,
  groupId: string,
  order: string[],
): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/slot-order`, {
    method: 'PUT',
    body: JSON.stringify({ order }),
    token,
  });
}
