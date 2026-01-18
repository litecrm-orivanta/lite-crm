import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
    private audit: AuditService,
  ) {}

  /**
   * Import leads from CSV data
   */
  async importFromCSV(
    workspaceId: string,
    userId: string,
    csvData: string,
    columnMapping: Record<string, string>,
  ) {
    const lines = csvData.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new BadRequestException('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const dataRows = lines.slice(1);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = this.parseCSVRow(row);

      try {
        const leadData: any = {};
        
        // Map CSV columns to lead fields
        for (const [csvColumn, leadField] of Object.entries(columnMapping)) {
          const columnIndex = headers.indexOf(csvColumn);
          if (columnIndex >= 0 && values[columnIndex]) {
            leadData[leadField] = values[columnIndex].trim();
          }
        }

        // Validate required fields
        if (!leadData.name) {
          throw new Error('Name is required');
        }

        // Create lead
        const lead = await this.leadsService.create(userId, workspaceId, leadData as CreateLeadDto);
        await this.audit.log({
          actorId: userId,
          action: 'lead.create',
          resource: 'lead',
          resourceId: lead.id,
          workspaceId,
          metadata: { after: lead, source: 'bulk_import' },
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * Parse CSV row handling quoted values
   */
  private parseCSVRow(row: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    return values;
  }

  /**
   * Import from Google Sheets (requires Google Sheets API integration)
   * For now, this is a placeholder that accepts sheet data as JSON
   */
  async importFromGoogleSheets(
    workspaceId: string,
    userId: string,
    sheetData: any[],
    columnMapping: Record<string, string>,
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      try {
        const leadData: any = {};

        // Map sheet columns to lead fields
        for (const [sheetColumn, leadField] of Object.entries(columnMapping)) {
          if (row[sheetColumn]) {
            leadData[leadField] = String(row[sheetColumn]).trim();
          }
        }

        // Validate required fields
        if (!leadData.name) {
          throw new Error('Name is required');
        }

        // Create lead
        await this.leadsService.create(userId, workspaceId, leadData as CreateLeadDto);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * Preview CSV data for column mapping
   */
  previewCSV(csvData: string, maxRows: number = 5) {
    const lines = csvData.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      throw new BadRequestException('CSV is empty');
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const previewRows = lines.slice(1, maxRows + 1).map((row) => {
      const values = this.parseCSVRow(row);
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      return rowData;
    });

    return {
      headers,
      preview: previewRows,
      totalRows: lines.length - 1,
    };
  }
}
