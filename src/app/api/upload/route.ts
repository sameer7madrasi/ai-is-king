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
  console.log('API route called');
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no');
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = buffer.toString('utf-8');
    console.log('File size:', buffer.length, 'bytes');

    // Detect file type by extension
    const fileName = (file as any).name as string | undefined;
    console.log('File name:', fileName);
    let data: any[] = [];
    let columns: string[] = [];
    let parseError: string | null = null;

    if (fileName && (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))) {
      console.log('Parsing Excel file...');
      // Parse Excel file
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        console.log('Workbook sheets:', workbook.SheetNames);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        console.log('Sheet name:', sheetName);
        console.log('Sheet range:', sheet['!ref']);
        
        // Find the actual data table by looking for the first row with multiple non-empty cells
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        let headerRow = -1;
        let dataStartRow = -1;
        
        // Find the header row (first row with multiple non-empty cells)
        for (let row = range.s.r; row <= range.e.r; row++) {
          let nonEmptyCells = 0;
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];
            if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
              nonEmptyCells++;
            }
          }
          if (nonEmptyCells >= 2) { // At least 2 columns to be considered a header
            headerRow = row;
            dataStartRow = row + 1;
            break;
          }
        }
        
        if (headerRow === -1) {
          throw new Error('Could not find a valid header row in the sheet');
        }
        
        console.log('Header row found at:', headerRow);
        console.log('Data starts at row:', dataStartRow);
        
        // Get column headers from the detected header row
        const headers = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
          const cell = sheet[cellAddress];
          if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
            headers.push(cell.v.toString());
          } else {
            headers.push(`Column${col + 1}`);
          }
        }
        columns = headers;
        console.log('Column headers:', columns);
        
        // Parse data starting from the row after the header
        data = XLSX.utils.sheet_to_json(sheet, { 
          defval: null, 
          header: headers,
          range: dataStartRow
        });
        
        // Filter out completely empty rows
        data = data.filter(row => {
          return Object.values(row).some(value => 
            value !== null && value !== undefined && value !== ''
          );
        });
        
        console.log('Parsed data length:', data.length);
        console.log('First row of data:', data[0]);
        console.log('Excel parsed successfully. Rows:', data.length, 'Columns:', columns);
      } catch (e) {
        console.error('Excel parse error:', e);
        parseError = `Failed to parse Excel file: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
    } else {
      console.log('Parsing CSV file...');
      // Parse CSV
      const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
      if (parsed.errors.length > 0) {
        console.error('CSV parse errors:', parsed.errors);
        parseError = 'Failed to parse CSV';
      } else {
        data = parsed.data;
        columns = parsed.meta.fields || [];
        console.log('CSV parsed successfully. Rows:', data.length, 'Columns:', columns.length);
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

    const response = {
      numRows,
      numColumns: columns.length,
      columns,
      columnTypes,
      sample: data.slice(0, 5),
    };
    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 