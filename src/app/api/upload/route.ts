import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import { databaseService } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
        console.log('Workbook sheets:', workbook.worksheets.map(ws => ws.name));
        const worksheet = workbook.worksheets[0];
        console.log('Sheet name:', worksheet.name);
        
        // Find the actual data table by looking for the first row with multiple non-empty cells
        let headerRow = -1;
        let dataStartRow = -1;
        
        // Find the header row (first row with multiple non-empty cells)
        for (let row = 1; row <= worksheet.rowCount; row++) {
          const rowData = worksheet.getRow(row);
          let nonEmptyCells = 0;
          
          rowData.eachCell((cell) => {
            if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
              nonEmptyCells++;
            }
          });
          
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
        const headerRowData = worksheet.getRow(headerRow);
        const headers: string[] = [];
        
        headerRowData.eachCell((cell, colNumber) => {
          if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
            headers[colNumber - 1] = cell.value.toString();
          } else {
            headers[colNumber - 1] = `Column${colNumber}`;
          }
        });
        
        columns = headers;
        console.log('Column headers:', columns);
        
        // Parse data starting from the row after the header
        data = [];
        for (let row = dataStartRow; row <= worksheet.rowCount; row++) {
          const rowData = worksheet.getRow(row);
          const rowObject: Record<string, any> = {};
          let hasData = false;
          
          rowData.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowObject[header] = cell.value;
              if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
                hasData = true;
              }
            }
          });
          
          // Only add rows that have at least some data
          if (hasData) {
            data.push(rowObject);
          }
        }
        
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
      fileId: uuidv4(),
      numRows,
      numColumns: columns.length,
      columns,
      columnTypes,
      sample: data.slice(0, 5),
    };
    console.log('Sending response:', response);
    
    // Save data to database
    try {
      await databaseService.saveFileData(
        response.fileId,
        fileName || 'unknown',
        buffer.length,
        data,
        columns,
        columnTypes
      );
      console.log('Data saved to database successfully');
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue with response even if database save fails
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 