import { apiCall } from './client';

// GAP-033: tambah 'disbanded'
export interface Group {
  id: string;
  name: string;
  nominal: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  total_periods: number;
  draw_mode: 'random' | 'fixed' | 'manual';
  invite_code: string;
  status: 'recruiting' | 'active' | 'completed' | 'disbanded';
  created_by: string;
  created_at: string;
}

// GAP-005+GAP-034: hanya field yang tersedia dari backend query
export interface GroupMember {
  user_id: string;
  slot_order: number | null;
  user: { id: string; name: string | null; phone: string };
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  current_period: number | null;
  current_period_id: string | null;
}

// Raw types dari backend (DB field names)
interface RawGroup {
  id: string;
  name: string;
  nominal: number;
  frekuensi: string;
  jumlah_periode: number;
  mode_undian: string;
  invite_code: string;
  status: string;
  ketua_id: string;
  created_at: string;
}

interface RawMember {
  user_id: string;
  urutan: number | null;
  users: { id: string; name: string | null; phone: string };
}

function adaptGroup(raw: RawGroup): Group {
  return {
    id: raw.id,
    name: raw.name,
    nominal: raw.nominal,
    frequency: raw.frekuensi as Group['frequency'],
    total_periods: raw.jumlah_periode,
    draw_mode: raw.mode_undian as Group['draw_mode'],
    invite_code: raw.invite_code,
    status: raw.status as Group['status'],
    created_by: raw.ketua_id,
    created_at: raw.created_at,
  };
}

function adaptMember(raw: RawMember): GroupMember {
  return {
    user_id: raw.user_id ?? (raw.users as { id: string }).id,
    slot_order: raw.urutan,
    user: raw.users,
  };
}

// GAP-004: unwrap { groups: [...] }
export function getMyGroups(token: string): Promise<Group[]> {
  return apiCall<{ groups: RawGroup[] }>('/api/groups', { token }).then((r) =>
    r.groups.map(adaptGroup),
  );
}

// GAP-005+GAP-034: remap semua field + members
export function getGroupDetail(token: string, groupId: string): Promise<GroupDetail> {
  return apiCall<{
    group: RawGroup;
    members: RawMember[];
    current_period_id: string | null;
    current_period: number | null;
  }>(`/api/groups/${groupId}`, { token }).then(({ group, members, current_period_id, current_period }) => ({
    ...adaptGroup(group),
    members: members.map(adaptMember),
    current_period,
    current_period_id,
  }));
}

// GAP-006: remap field names ke bahasa Indonesia sesuai backend Zod schema
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
  return apiCall<{ group: RawGroup }>('/api/groups', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      nominal: data.nominal,
      frekuensi: data.frequency,
      jumlah_periode: data.total_periods,
      mode_undian: data.draw_mode,
    }),
    token,
  }).then((r) => adaptGroup(r.group));
}

export function joinGroup(token: string, invite_code: string): Promise<{ message: string }> {
  return apiCall('/api/groups/join', {
    method: 'POST',
    body: JSON.stringify({ invite_code }),
    token,
  });
}

// GAP-009: endpoint ini sekarang ada di backend
export function getGroupByCode(
  token: string,
  invite_code: string,
): Promise<Group & { member_count: number }> {
  return apiCall<RawGroup & { member_count: number }>(`/api/groups/code/${invite_code}`, {
    token,
  }).then((r) => ({ ...adaptGroup(r), member_count: r.member_count }));
}

export function leaveGroup(token: string, groupId: string): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/leave`, {
    method: 'POST',
    token,
  });
}

// GAP-010: endpoint ini sekarang ada di backend
export function generateInvite(token: string, groupId: string): Promise<{ invite_code: string }> {
  return apiCall(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    token,
  });
}

// GAP-011: fix URL (/urutan bukan /slot-order) + field name (urutan bukan order)
export function setSlotOrder(
  token: string,
  groupId: string,
  order: string[],
): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}/urutan`, {
    method: 'PUT',
    body: JSON.stringify({ urutan: order }),
    token,
  });
}

export function disbandGroup(token: string, groupId: string): Promise<{ message: string }> {
  return apiCall(`/api/groups/${groupId}`, {
    method: 'DELETE',
    token,
  });
}

export function setTanggalPelaksanaan(
  token: string,
  groupId: string,
  periodId: string,
  tanggal: string,
): Promise<{ tanggal_pelaksanaan: string; jatuh_tempo: string }> {
  return apiCall(`/api/groups/${groupId}/periods/${periodId}/tanggal`, {
    method: 'PUT',
    body: JSON.stringify({ tanggal_pelaksanaan: tanggal }),
    token,
  });
}
