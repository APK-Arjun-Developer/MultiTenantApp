import { z } from 'zod';
import { FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import type { AddressDto, AddressRequest } from '@/types/api';

const optStr = (max: number) => z.string().max(max).optional().or(z.literal(''));

/** Trims a string and returns null if the result is empty or undefined. */
const nonEmpty = (value: string | undefined): string | null => {
  const t = value?.trim();
  if (!t) return null;
  return t;
};
const reqStr = (max: number) => z.string().min(1, 'Required').max(max);

export const addressZodShape = {
  addressLine1: optStr(200),
  addressLine2: optStr(200),
  addressCity: optStr(100),
  addressState: optStr(100),
  addressPostalCode: optStr(20),
  addressCountry: optStr(100),
};

export function getAddressFields(
  address?: AddressDto | null,
  section?: string,
  required?: boolean,
): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: 'Address line 1',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.line1 ?? '',
      section,
    },
    {
      name: 'addressLine2',
      label: 'Address line 2',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.line2 ?? '',
      section,
    },
    {
      name: 'addressCity',
      label: 'City',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.city ?? '',
      section,
    },
    {
      name: 'addressState',
      label: 'State / Province',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.state ?? '',
      section,
    },
    {
      name: 'addressPostalCode',
      label: 'Postal code',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.postalCode ?? '',
      section,
    },
    {
      name: 'addressCountry',
      label: 'Country',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.country ?? '',
      section,
    },
  ];
}

export const requiredAddressZodShape = {
  addressLine1: reqStr(200),
  addressLine2: optStr(200),
  addressCity: reqStr(100),
  addressState: optStr(100),
  addressPostalCode: reqStr(20),
  addressCountry: reqStr(100),
};

export function getSameAsCompanyField(section?: string): FieldConfig {
  return {
    name: 'sameAsCompany',
    label: 'Same as company address',
    type: FIELD_TYPE.CHECKBOX,
    defaultValue: false,
    section,
  };
}

export interface AddressValues {
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
}

/** Converts flat form values into the nested address payload for PUT requests. */
export function buildAddressPayload(values: AddressValues): {
  address?: AddressRequest;
  clearAddress?: boolean;
} {
  const line1 = nonEmpty(values.addressLine1);
  const line2 = nonEmpty(values.addressLine2);
  const city = nonEmpty(values.addressCity);
  const state = nonEmpty(values.addressState);
  const postalCode = nonEmpty(values.addressPostalCode);
  const country = nonEmpty(values.addressCountry);

  const hasAny = [line1, line2, city, state, postalCode, country].some(Boolean);
  return hasAny
    ? { address: { line1, line2, city, state, postalCode, country } }
    : { clearAddress: true };
}

// ─── Tenant address (separate field names, used when both user + company sections are shown) ───

export const tenantAddressZodShape = {
  tenantAddressLine1: optStr(200),
  tenantAddressLine2: optStr(200),
  tenantAddressCity: optStr(100),
  tenantAddressState: optStr(100),
  tenantAddressPostalCode: optStr(20),
  tenantAddressCountry: optStr(100),
};

export function getTenantAddressFields(
  address?: AddressDto | null,
  section?: string,
  required?: boolean,
): FieldConfig[] {
  return [
    {
      name: 'tenantAddressLine1',
      label: 'Address line 1',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.line1 ?? '',
      section,
    },
    {
      name: 'tenantAddressLine2',
      label: 'Address line 2',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.line2 ?? '',
      section,
    },
    {
      name: 'tenantAddressCity',
      label: 'City',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.city ?? '',
      section,
    },
    {
      name: 'tenantAddressState',
      label: 'State / Province',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.state ?? '',
      section,
    },
    {
      name: 'tenantAddressPostalCode',
      label: 'Postal code',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.postalCode ?? '',
      section,
    },
    {
      name: 'tenantAddressCountry',
      label: 'Country',
      type: FIELD_TYPE.TEXT,
      required: required ?? false,
      defaultValue: address?.country ?? '',
      section,
    },
  ];
}

export const requiredTenantAddressZodShape = {
  tenantAddressLine1: reqStr(200),
  tenantAddressLine2: optStr(200),
  tenantAddressCity: reqStr(100),
  tenantAddressState: optStr(100),
  tenantAddressPostalCode: reqStr(20),
  tenantAddressCountry: reqStr(100),
};

export interface TenantAddressValues {
  tenantAddressLine1?: string;
  tenantAddressLine2?: string;
  tenantAddressCity?: string;
  tenantAddressState?: string;
  tenantAddressPostalCode?: string;
  tenantAddressCountry?: string;
}

export function buildTenantAddressPayload(values: TenantAddressValues): {
  address?: AddressRequest;
  clearAddress?: boolean;
} {
  const line1 = nonEmpty(values.tenantAddressLine1);
  const line2 = nonEmpty(values.tenantAddressLine2);
  const city = nonEmpty(values.tenantAddressCity);
  const state = nonEmpty(values.tenantAddressState);
  const postalCode = nonEmpty(values.tenantAddressPostalCode);
  const country = nonEmpty(values.tenantAddressCountry);

  const hasAny = [line1, line2, city, state, postalCode, country].some(Boolean);
  return hasAny
    ? { address: { line1, line2, city, state, postalCode, country } }
    : { clearAddress: true };
}
