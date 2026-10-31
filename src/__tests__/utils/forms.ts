import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The input/textarea whose label starts with `label` (ignores the required "*"). */
const field = (label: string) =>
  screen.getByLabelText(new RegExp(`^${escapeRegExp(label)}`, 'i'), {
    selector: 'input, textarea',
  });

/** Clears and types each value into the field labelled with its key. */
const fillFields = async (user: UserEvent, values: Record<string, string>) => {
  for (const [label, value] of Object.entries(values)) {
    const input = field(label);
    await user.clear(input);
    if (value) await user.type(input, value);
  }
};

/** A valid required address, keyed by the address field labels. */
const validAddress = {
  'Address line 1': '1 Main St',
  City: 'Springfield',
  'Postal code': '12345',
  Country: 'USA',
};

/** The API payload `validAddress` serializes to. */
const validAddressPayload = {
  line1: '1 Main St',
  line2: null,
  city: 'Springfield',
  state: null,
  postalCode: '12345',
  country: 'USA',
};

const STRONG_PASSWORD = 'Str0ng!Pass';

export { field, fillFields, STRONG_PASSWORD, validAddress, validAddressPayload };
