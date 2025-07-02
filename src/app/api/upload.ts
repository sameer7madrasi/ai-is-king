"use client";

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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

  // Detect file type by extension
  const fileName = (file as any).name as string | undefined;
  let data: any[] = [];
  let columns: string[] = [];
  let parseError: string | null = null;

  if (fileName && (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))) {
    // Parse Excel file
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet, { defval: null });
      columns = sheet ? Object.keys(XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || {}) : [];
    } catch (e) {
      parseError = 'Failed to parse Excel file';
    }
  } else {
    // Parse CSV
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
    if (parsed.errors.length > 0) {
      parseError = 'Failed to parse CSV';
    } else {
      data = parsed.data;
      columns = parsed.meta.fields || [];
    }
  }

  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

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