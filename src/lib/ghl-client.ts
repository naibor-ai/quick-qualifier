/**
 * GoHighLevel API Client
 *
 * Handles all communication with the GHL API including:
 * - Custom Values (global configuration)
 * - Contacts (client data persistence)
 * - Partner agents (tagged contacts)
 */

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = process.env.GHL_BASE_URL || 'services.leadconnectorhq.com';

if (!GHL_API_KEY) {
  console.warn('GHL_API_KEY is not set in environment variables');
}

if (!GHL_LOCATION_ID) {
  console.warn('GHL_LOCATION_ID is not set in environment variables');
}

interface GhlApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface GhlCustomValue {
  id: string;
  name: string;
  value: string;
  locationId: string;
}

interface GhlContact {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  tags?: string[];
  customFields?: Array<{
    id: string;
    key: string;
    value: string;
  }>;
}

interface GhlContactsResponse {
  contacts: GhlContact[];
  meta?: {
    total: number;
    currentPage: number;
    nextPage: number | null;
  };
}

/**
 * Make an authenticated request to the GHL API.
 */
async function ghlFetch<T>(
  endpoint: string,
  options: GhlApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const url = `https://${GHL_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GHL API Error (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch all custom values for the location.
 */
export async function fetchCustomValues(): Promise<Record<string, string>> {
  const response = await ghlFetch<{ customValues: GhlCustomValue[] }>(
    `/locations/${GHL_LOCATION_ID}/customValues`
  );

  // Convert array to key-value object
  const values: Record<string, string> = {};
  for (const cv of response.customValues || []) {
    values[cv.name] = cv.value;
  }

  return values;
}

/**
 * Fetch a specific custom value by name.
 */
export async function fetchCustomValue(name: string): Promise<string | null> {
  const values = await fetchCustomValues();
  return values[name] ?? null;
}

/**
 * Search contacts by email or name.
 */
export async function searchContacts(
  query: string,
  limit: number = 10
): Promise<GhlContact[]> {
  const response = await ghlFetch<GhlContactsResponse>(
    `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(query)}&limit=${limit}`
  );

  return response.contacts || [];
}

/**
 * Get a contact by ID.
 */
export async function getContact(contactId: string): Promise<GhlContact | null> {
  try {
    const response = await ghlFetch<{ contact: GhlContact }>(
      `/contacts/${contactId}`
    );
    return response.contact;
  } catch {
    return null;
  }
}

/**
 * Create or update a contact (upsert by email).
 */
export async function upsertContact(
  data: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    customFields?: Array<{ key: string; value: string }>;
    tags?: string[];
  }
): Promise<GhlContact> {
  // First, try to find existing contact by email
  if (data.email) {
    const existing = await searchContacts(data.email, 1);
    if (existing.length > 0) {
      // Update existing contact
      const response = await ghlFetch<{ contact: GhlContact }>(
        `/contacts/${existing[0].id}`,
        {
          method: 'PUT',
          body: {
            ...data,
            locationId: GHL_LOCATION_ID,
          },
        }
      );
      return response.contact;
    }
  }

  // Create new contact
  const response = await ghlFetch<{ contact: GhlContact }>('/contacts/', {
    method: 'POST',
    body: {
      ...data,
      locationId: GHL_LOCATION_ID,
    },
  });

  return response.contact;
}

/**
 * Get contacts tagged as partner agents.
 */
export async function getPartnerAgents(): Promise<GhlContact[]> {
  if (!isGhlConfigured()) {
    console.warn('GHL not configured, returning empty partner agents list');
    return [];
  }

  try {
    const response = await ghlFetch<GhlContactsResponse>(
      `/contacts/?locationId=${GHL_LOCATION_ID}&tags=partner-agent&limit=100`
    );
    return response.contacts || [];
  } catch (err) {
    console.error('Failed to fetch partner agents:', err);
    // Return empty list instead of throwing to prevent pages from breaking
    return [];
  }
}

/**
 * Save calculator state to a contact's custom field.
 */
export async function saveCalculatorState(
  contactId: string,
  state: Record<string, unknown>
): Promise<void> {
  await ghlFetch(`/contacts/${contactId}`, {
    method: 'PUT',
    body: {
      customFields: [
        {
          key: 'calculator_state_json',
          value: JSON.stringify(state),
        },
      ],
    },
  });
}

/**
 * Load calculator state from a contact's custom field.
 */
export async function loadCalculatorState(
  contactId: string
): Promise<Record<string, unknown> | null> {
  const contact = await getContact(contactId);
  if (!contact?.customFields) return null;

  const stateField = contact.customFields.find(
    (f) => f.key === 'calculator_state_json'
  );

  if (!stateField?.value) return null;

  try {
    return JSON.parse(stateField.value);
  } catch {
    return null;
  }
}

/**
 * Get custom field value from a contact.
 */
export function getContactCustomField(
  contact: GhlContact,
  key: string
): string | undefined {
  return contact.customFields?.find((f) => f.key === key)?.value;
}

/**
 * Check if GHL is configured.
 */
export function isGhlConfigured(): boolean {
  return Boolean(GHL_API_KEY && GHL_LOCATION_ID);
}
