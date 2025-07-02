"use client";

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const text = buffer.toString('utf-8');

  // Parse CSV
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: 'Failed to parse CSV', details: parsed.errors }, { status: 400 });
  }

  const data = parsed.data;
  const columns = parsed.meta.fields || [];
  const numRows = data.length;
  const columnTypes: Record<string, string> = {};
  if (data.length > 0) {
    columns.forEach((col: string) => {
      const val = (data[0] as Record<string, unknown>)[col];
      columnTypes[col] = typeof val;
    });
  }

  return NextResponse.json({
    numRows,
    numColumns: columns.length,
    columns,
    columnTypes,
    sample: data.slice(0, 5),
  });
} 