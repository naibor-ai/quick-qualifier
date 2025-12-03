import { NextResponse } from 'next/server';
import { fetchCustomValues, isGhlConfigured } from '@/lib/ghl-client';
import { sanitizeGhlConfig } from '@/lib/sanitize';
import { GhlConfigSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/config
 *
 * Fetches global configuration from GHL Custom Values.
 * All values are sanitized and validated before returning.
 */
export async function GET() {
  try {
    if (!isGhlConfigured()) {
      return NextResponse.json(
        { error: 'GHL API is not configured' },
        { status: 500 }
      );
    }

    // Fetch raw custom values from GHL
    const rawValues = await fetchCustomValues();

    // Sanitize and transform into structured config
    const sanitizedConfig = sanitizeGhlConfig(rawValues);

    // Validate against schema
    const parseResult = GhlConfigSchema.safeParse(sanitizedConfig);

    if (!parseResult.success) {
      console.error('Config validation errors:', parseResult.error.issues);
      // Return sanitized config anyway (with defaults for missing values)
      return NextResponse.json(sanitizedConfig);
    }

    return NextResponse.json(parseResult.data);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}
