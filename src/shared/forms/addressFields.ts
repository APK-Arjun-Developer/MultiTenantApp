import { FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { z } from 'zod';

import type { AddressDto, AddressRequest } from '@/types/api';

const optStr = (max: number) => z.string().max(max).optional().or(z.literal(''));

const nonEmpty = (value: string | null | undefined): string | null => {
  const t = value?.trim();
  if (!t) return null;
  return t;
};
const reqStr = (max: number) => z.string().min(1, 'Required').max(max);

const addressZodShape = {
  addressLine1: optStr(200),
  addressLine2: optStr(200),
  addressCity: optStr(100),
  addressState: optStr(100),
  addressPostalCode: optStr(20),
  addressCountry: optStr(100),
};

const addressFields = [
  { suffix: 'Line1', key: 'line1', label: 'Address line 1', required: true },
  { suffix: 'Line2', key: 'line2', label: 'Address line 2', required: false },
  { suffix: 'City', key: 'city', label: 'City', required: true },
  { suffix: 'State', key: 'state', label: 'State / Province', required: false },
  { suffix: 'PostalCode', key: 'postalCode', label: 'Postal code', required: true },
  { suffix: 'Country', key: 'country', label: 'Country', required: true },
] as const;

const createAddressFields = (
  prefix: 'address' | 'tenantAddress',
  address?: AddressDto | null,
  section?: string,
  required = false,
): FieldConfig[] =>
  addressFields.map((field) => ({
    name: prefix + field.suffix,
    label: field.label,
    type: FIELD_TYPE.TEXT,
    ...(field.required && { required }),
    defaultValue: address?.[field.key] ?? '',
    section,
  }));

const getAddressFields = (address?: AddressDto | null, section?: string, required?: boolean) =>
  createAddressFields('address', address, section, required);

const requiredAddressZodShape = {
  addressLine1: reqStr(200),
  addressLine2: optStr(200),
  addressCity: reqStr(100),
  addressState: optStr(100),
  addressPostalCode: reqStr(20),
  addressCountry: reqStr(100),
};

const getSameAsCompanyField = (section?: string): FieldConfig => {
  return {
    name: 'sameAsCompany',
    label: 'Same as company address',
    type: FIELD_TYPE.CHECKBOX,
    defaultValue: false,
    section,
  };
};

interface AddressValues {
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
}

const normalizeAddress = (
  values: AddressRequest,
): {
  address?: AddressRequest;
  clearAddress?: boolean;
} => {
  const address = {
    line1: nonEmpty(values.line1),
    line2: nonEmpty(values.line2),
    city: nonEmpty(values.city),
    state: nonEmpty(values.state),
    postalCode: nonEmpty(values.postalCode),
    country: nonEmpty(values.country),
  };
  return Object.values(address).some(Boolean) ? { address } : { clearAddress: true };
};

const buildAddressPayload = (values: AddressValues) =>
  normalizeAddress({
    line1: values.addressLine1,
    line2: values.addressLine2,
    city: values.addressCity,
    state: values.addressState,
    postalCode: values.addressPostalCode,
    country: values.addressCountry,
  });

const tenantAddressZodShape = {
  tenantAddressLine1: optStr(200),
  tenantAddressLine2: optStr(200),
  tenantAddressCity: optStr(100),
  tenantAddressState: optStr(100),
  tenantAddressPostalCode: optStr(20),
  tenantAddressCountry: optStr(100),
};

const getTenantAddressFields = (
  address?: AddressDto | null,
  section?: string,
  required?: boolean,
) => createAddressFields('tenantAddress', address, section, required);

const requiredTenantAddressZodShape = {
  tenantAddressLine1: reqStr(200),
  tenantAddressLine2: optStr(200),
  tenantAddressCity: reqStr(100),
  tenantAddressState: optStr(100),
  tenantAddressPostalCode: reqStr(20),
  tenantAddressCountry: reqStr(100),
};

interface TenantAddressValues {
  tenantAddressLine1?: string;
  tenantAddressLine2?: string;
  tenantAddressCity?: string;
  tenantAddressState?: string;
  tenantAddressPostalCode?: string;
  tenantAddressCountry?: string;
}

const buildTenantAddressPayload = (values: TenantAddressValues) =>
  normalizeAddress({
    line1: values.tenantAddressLine1,
    line2: values.tenantAddressLine2,
    city: values.tenantAddressCity,
    state: values.tenantAddressState,
    postalCode: values.tenantAddressPostalCode,
    country: values.tenantAddressCountry,
  });

export {
  type AddressValues,
  addressZodShape,
  buildAddressPayload,
  buildTenantAddressPayload,
  getAddressFields,
  getSameAsCompanyField,
  getTenantAddressFields,
  requiredAddressZodShape,
  requiredTenantAddressZodShape,
  type TenantAddressValues,
  tenantAddressZodShape,
};
