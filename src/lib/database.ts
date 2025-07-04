import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  numRows: number;
  numColumns: number;
  columns: string[];
  columnTypes: Record<string, string>;
}

export interface DataRow {
  [key: string]: any;
}

class DatabaseService {
  private db: Database | null = null;

  async initialize() {
    if (!this.db) {
      this.db = await open({
        filename: path.join(process.cwd(), 'data.db'),
        driver: sqlite3.Database
      });

      // Create tables
      await this.createTables();
    }
    return this.db;
  }

  private async createTables() {
    if (!this.db) return;

    // Files metadata table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        fileName TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        uploadDate TEXT NOT NULL,
        numRows INTEGER NOT NULL,
        numColumns INTEGER NOT NULL,
        columns TEXT NOT NULL,
        columnTypes TEXT NOT NULL
      )
    `);

    // Data storage table (dynamic structure)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS data_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileId TEXT NOT NULL,
        rowIndex INTEGER NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (fileId) REFERENCES files (id)
      )
    `);
  }

  async saveFileData(
    fileId: string,
    fileName: string,
    fileSize: number,
    data: any[],
    columns: string[],
    columnTypes: Record<string, string>
  ) {
    const db = await this.initialize();

    // Save file metadata
    await db.run(
      `INSERT INTO files (id, fileName, fileSize, uploadDate, numRows, numColumns, columns, columnTypes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId,
        fileName,
        fileSize,
        new Date().toISOString(),
        data.length,
        columns.length,
        JSON.stringify(columns),
        JSON.stringify(columnTypes)
      ]
    );

    // Save data rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      await db.run(
        `INSERT INTO data_entries (fileId, rowIndex, data) VALUES (?, ?, ?)`,
        [fileId, i, JSON.stringify(row)]
      );
    }
  }

  async getAllFiles(): Promise<FileMetadata[]> {
    const db = await this.initialize();
    console.log('Database: Getting all files...');
    
    const files = await db.all('SELECT * FROM files ORDER BY uploadDate DESC');
    console.log('Database: Found files:', files.length);
    
    const result = files.map((file: any) => ({
      ...file,
      columns: JSON.parse(file.columns),
      columnTypes: JSON.parse(file.columnTypes)
    }));
    
    console.log('Database: Processed files:', result.map(f => ({ id: f.id, name: f.fileName, rows: f.numRows })));
    return result;
  }

  async getFileData(fileId: string): Promise<DataRow[]> {
    const db = await this.initialize();
    console.log('Database: Getting data for file:', fileId);
    
    const rows = await db.all(
      'SELECT data FROM data_entries WHERE fileId = ? ORDER BY rowIndex',
      [fileId]
    );
    
    console.log('Database: Found data rows:', rows.length);
    
    const result = rows.map((row: any) => JSON.parse(row.data));
    console.log('Database: First row sample:', result[0]);
    
    return result;
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const db = await this.initialize();
    const file = await db.get('SELECT * FROM files WHERE id = ?', [fileId]);
    
    if (!file) return null;
    
    return {
      ...file,
      columns: JSON.parse(file.columns),
      columnTypes: JSON.parse(file.columnTypes)
    };
  }

  async queryData(query: string): Promise<any[]> {
    const db = await this.initialize();
    
    // For security, we'll implement a safe query interface
    // For now, return all data from all files
    const allData = await db.all(`
      SELECT f.fileName, f.uploadDate, de.data
      FROM files f
      JOIN data_entries de ON f.id = de.fileId
      ORDER BY f.uploadDate DESC, de.rowIndex
    `);
    
    return allData.map((row: any) => ({
      fileName: row.fileName,
      uploadDate: row.uploadDate,
      ...JSON.parse(row.data)
    }));
  }

  async getDataSummary(): Promise<{
    totalFiles: number;
    totalRows: number;
    dateRange: { start: string; end: string };
    columns: string[];
  }> {
    const db = await this.initialize();
    
    const totalFiles = await db.get('SELECT COUNT(*) as count FROM files');
    const totalRows = await db.get('SELECT COUNT(*) as count FROM data_entries');
    const dateRange = await db.get(`
      SELECT 
        MIN(uploadDate) as start,
        MAX(uploadDate) as end
      FROM files
    `);
    
    const allColumns = await db.all('SELECT columns FROM files');
    const uniqueColumns = new Set<string>();
    allColumns.forEach((file: any) => {
      JSON.parse(file.columns).forEach((col: string) => uniqueColumns.add(col));
    });

    return {
      totalFiles: totalFiles.count,
      totalRows: totalRows.count,
      dateRange: {
        start: dateRange.start || '',
        end: dateRange.end || ''
      },
      columns: Array.from(uniqueColumns)
    };
  }
}

export const databaseService = new DatabaseService(); 