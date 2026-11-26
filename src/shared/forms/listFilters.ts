import { FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';

import { ACTIVE_STATUS_OPTIONS, CREATED_VIA_OPTIONS } from '@/shared/constants/filterOptions';

const getListFilterFields = (placeholder: string): FieldConfig[] => [
  {
    name: 'search',
    label: 'Search',
    type: FIELD_TYPE.SEARCH,
    placeholder,
    grid: { xs: 12, sm: 5 },
  },
  {
    name: 'status',
    label: 'Status',
    type: FIELD_TYPE.SELECT,
    options: ACTIVE_STATUS_OPTIONS,
    grid: { xs: 6, sm: 3 },
  },
  {
    name: 'createdVia',
    label: 'Created via',
    type: FIELD_TYPE.SELECT,
    options: CREATED_VIA_OPTIONS,
    grid: { xs: 6, sm: 4 },
  },
];

export { getListFilterFields };
