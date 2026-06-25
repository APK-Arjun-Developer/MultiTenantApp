import { z } from 'zod';
import { FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import type { AddressDto, AddressRequest } from '@/types/api';

const optStr = (max: number) => z.string().max(max).optional().or(z.literal(''));

export const addressZodShape = {
  addressLine1: optStr(200),
  addressLine2: optStr(200),
  addressCity: optStr(100),
  addressState: optStr(100),
  addressPostalCode: optStr(20),
  addressCountry: optStr(100),
};

export function getAddressFields(address?: AddressDto | null, section?: string): FieldConfig[] {
  return [
    {
      name: 'addressLine1',
      label: 'Address line 1',
      type: FIELD_TYPE.TEXT,
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
      defaultValue: address?.postalCode ?? '',
      section,
    },
    {
      name: 'addressCountry',
      label: 'Country',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.country ?? '',
      section,
    },
  ];
}

export function getSameAsCompanyField(section?: string): FieldConfig {
  return {
    name: 'sameAsCompany',
    label: 'Same as company address',
    type: FIELD_TYPE.CHECKBOX,
    defaultValue: false,
    section,
  };
}

interface AddressValues {
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
  const line1 = values.addressLine1?.trim() || null;
  const line2 = values.addressLine2?.trim() || null;
  const city = values.addressCity?.trim() || null;
  const state = values.addressState?.trim() || null;
  const postalCode = values.addressPostalCode?.trim() || null;
  const country = values.addressCountry?.trim() || null;

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
): FieldConfig[] {
  return [
    {
      name: 'tenantAddressLine1',
      label: 'Address line 1',
      type: FIELD_TYPE.TEXT,
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
      defaultValue: address?.postalCode ?? '',
      section,
    },
    {
      name: 'tenantAddressCountry',
      label: 'Country',
      type: FIELD_TYPE.TEXT,
      defaultValue: address?.country ?? '',
      section,
    },
  ];
}

interface TenantAddressValues {
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
  const line1 = values.tenantAddressLine1?.trim() || null;
  const line2 = values.tenantAddressLine2?.trim() || null;
  const city = values.tenantAddressCity?.trim() || null;
  const state = values.tenantAddressState?.trim() || null;
  const postalCode = values.tenantAddressPostalCode?.trim() || null;
  const country = values.tenantAddressCountry?.trim() || null;

  const hasAny = [line1, line2, city, state, postalCode, country].some(Boolean);
  return hasAny
    ? { address: { line1, line2, city, state, postalCode, country } }
    : { clearAddress: true };
}
