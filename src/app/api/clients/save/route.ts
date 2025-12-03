import { NextRequest, NextResponse } from 'next/server';
import { upsertContact, isGhlConfigured } from '@/lib/ghl-client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SaveClientSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  calculatorState: z.record(z.string(), z.unknown()),
  // Searchable fields
  loanAmount: z.number().optional(),
  salesPrice: z.number().optional(),
  interestRate: z.number().optional(),
  loanProgram: z.string().optional(),
});

/**
 * POST /api/clients/save
 *
 * Saves or updates a client with their calculator state.
 * Upserts based on email (if provided).
 */
export async function POST(request: NextRequest) {
  try {
    if (!isGhlConfigured()) {
      return NextResponse.json(
        { error: 'GHL API is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parseResult = SaveClientSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Build custom fields for GHL
    const customFields: Array<{ key: string; value: string }> = [
      {
        key: 'calculator_state_json',
        value: JSON.stringify(data.calculatorState),
      },
    ];

    if (data.loanAmount !== undefined) {
      customFields.push({
        key: 'loan_amount',
        value: String(data.loanAmount),
      });
    }

    if (data.salesPrice !== undefined) {
      customFields.push({
        key: 'sales_price',
        value: String(data.salesPrice),
      });
    }

    if (data.interestRate !== undefined) {
      customFields.push({
        key: 'interest_rate',
        value: String(data.interestRate),
      });
    }

    if (data.loanProgram) {
      customFields.push({
        key: 'loan_program',
        value: data.loanProgram,
      });
    }

    // Upsert contact in GHL
    const contact = await upsertContact({
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      customFields,
      tags: ['calculator-client'],
    });

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    });
  } catch (error) {
    console.error('Error saving client:', error);
    return NextResponse.json(
      { error: 'Failed to save client' },
      { status: 500 }
    );
  }
}
