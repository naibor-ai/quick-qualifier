import { NextRequest, NextResponse } from 'next/server';
import {
  searchContacts,
  getContact,
  getContactCustomField,
  isGhlConfigured,
} from '@/lib/ghl-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients/load?query=...
 * GET /api/clients/load?id=...
 *
 * Loads a client's calculator state.
 * Can search by query (email/name) or load directly by contact ID.
 */
export async function GET(request: NextRequest) {
  try {
    if (!isGhlConfigured()) {
      return NextResponse.json(
        { error: 'GHL API is not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const contactId = searchParams.get('id');

    // Load by ID
    if (contactId) {
      const contact = await getContact(contactId);

      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      const stateJson = getContactCustomField(contact, 'calculator_state_json');
      let calculatorState = null;

      if (stateJson) {
        try {
          calculatorState = JSON.parse(stateJson);
        } catch {
          console.warn('Failed to parse calculator state JSON');
        }
      }

      return NextResponse.json({
        contact: {
          id: contact.id,
          email: contact.email,
          phone: contact.phone,
          firstName: contact.firstName,
          lastName: contact.lastName,
          name: contact.name,
        },
        calculatorState,
      });
    }

    // Search by query
    if (query) {
      const contacts = await searchContacts(query, 10);

      const results = contacts.map((contact) => ({
        id: contact.id,
        email: contact.email,
        phone: contact.phone,
        firstName: contact.firstName,
        lastName: contact.lastName,
        name: contact.name,
        loanAmount: getContactCustomField(contact, 'loan_amount'),
        loanProgram: getContactCustomField(contact, 'loan_program'),
      }));

      return NextResponse.json({ contacts: results });
    }

    return NextResponse.json(
      { error: 'Either query or id parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error loading client:', error);
    return NextResponse.json(
      { error: 'Failed to load client' },
      { status: 500 }
    );
  }
}
