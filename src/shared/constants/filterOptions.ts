const ACTIVE_STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const CREATED_VIA_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Direct', value: 'Direct' },
  { label: 'Invitation', value: 'Invitation' },
];

const INVITATION_STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Expired', value: 'expired' },
  { label: 'Revoked', value: 'revoked' },
];

export { ACTIVE_STATUS_OPTIONS, CREATED_VIA_OPTIONS, INVITATION_STATUS_OPTIONS };
