import { NextResponse } from 'next/server';
import {
  getPartnerAgents,
  getContactCustomField,
  isGhlConfigured,
} from '@/lib/ghl-client';
import type { PartnerAgent } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agents
 *
 * Fetches all partner agents (contacts tagged with #partner-agent).
 * Returns agent info for co-branding on reports.
 */
export async function GET() {
  try {
    if (!isGhlConfigured()) {
      return NextResponse.json(
        { error: 'GHL API is not configured' },
        { status: 500 }
      );
    }

    const contacts = await getPartnerAgents();

    const agents: PartnerAgent[] = contacts.map((contact) => ({
      id: contact.id,
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
      email: contact.email,
      phone: contact.phone,
      headshotUrl: getContactCustomField(contact, 'headshot_url'),
      logoUrl: getContactCustomField(contact, 'logo_url'),
      company: getContactCustomField(contact, 'company'),
    }));

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner agents' },
      { status: 500 }
    );
  }
}
