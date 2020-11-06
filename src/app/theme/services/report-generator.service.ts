import { Injectable, OnDestroy } from '@angular/core';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { saveAs } from 'file-saver';
import { TitleCasePipe } from '@angular/common';
import { ReportConfig, ConfigService, Configuration } from './config/config.service';
import { ReadableKeyPipe } from './../pipes/reports/readable-key.pipe';

interface CellType {
  address: string;
  ssId: number;
  style: {};
  type: number;
  value?: string;
}

interface DataPoints {
  start: number;
  end: number;
  label?: string;
}

export interface ReportInfo {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportGeneratorService {

  private dataStartingPoints: DataPoints[] = [];

  private LABEL_COLORS = {
    success: 'ffb8f1ae',
    failed: 'fff59e9e',
    credited: 'ffadb9f5'
  };

  private reportMetaDetailRowPosition = 1;

  private readonly DEFAULT_ROW_COLOR = 'ffa4caf1';

  private readonly HEADER_POSITION = 6;

  private reportConfig?: ReportConfig;

  private doNotCalculateArray = ['Phone No'];
  private doNotCalculateColumn = [];

  constructor(private titleCase: TitleCasePipe, private configService: ConfigService,
    private readableKey: ReadableKeyPipe) {
    this.getReportConfig();
  }

  /**
   * Get report configuration
   */
  getReportConfig() {
    const configuration: Configuration = this.configService.getConfiguration();
    if (configuration) {
      this.reportConfig = configuration.reports;
    }
  }

  /**
   * Parse report meta data(title, meta data etc.)
   * @param commandText string
   */
  parseCommand(commandText: string) {
    const regex = /[:](date|time)/gm;
    const str = commandText;
    let m;

    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        switch (match) {
          case ':date':
            commandText = commandText.replace(/:date/gm, new Date().toString()); break;
          case ':time':
            commandText = commandText.replace(/:time/gm, new Date().toTimeString()); break;
          default:
            break;
        }
      });
    }
    return commandText;
  }

  /**
   * Get headers from report data
   * @param data any[]
   */
  getHeaderFromData(data: any[]): string[] {
    if (data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  }

  /**
   * Download ledger report
   * @param sheetName string
   * @param body any
   */
  downloadLedgerReport(sheetName: string, body: any) {
    this.dataStartingPoints = [];
    const workbook = new Excel.Workbook();

    // Add a worksheet
    const sheet = workbook.addWorksheet(sheetName);

    const header: any[] = this.getHeaderFromData(body.entries);

    const reportInfo: ReportInfo[][] = [
      [
        { key: 'Business Name', value: body.business_name },
        { key: 'PAN', value: body.pan },
        { key: 'GSTIN', value: body.gstin ? body.gstin : 'Unregistered' }
      ],
      [
        { key: 'Party Code', value: body.party_code },
        { key: 'From', value: body.from },
        { key: 'To', value: body.to }
      ]
    ];

    this.setSheetHeaders(header, sheet, this.HEADER_POSITION + reportInfo.length + 1);

    this.setCompanyDetails(sheet);
    this.setReportMetaDetails(sheet);

    let partyLedgerData: any[] = [];

    partyLedgerData = partyLedgerData.concat(this.getOpeningBalance(body));
    partyLedgerData = partyLedgerData.concat(this.setExcelData(body.entries, header));
    partyLedgerData = partyLedgerData.concat(this.getClosingBalance(body));

    this.setReportInfo(sheet, reportInfo);

    sheet.addRows(partyLedgerData);

    // Write excel file.
    workbook.xlsx.writeBuffer().then(function (data) {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, sheetName + '.xlsx');
    });
  }

  /**
   * Get opening balance
   * @param partyLedgerData any
   */
  getOpeningBalance(partyLedgerData: any) {
    return [
      ['', 'Opening balance', '-', '-', partyLedgerData.opening_balance]
    ];
  }

  /**
   * Get closing balance
   * @param partyLedgerData any
   */
  getClosingBalance(partyLedgerData: any) {
    return [
      ['', 'Closing balance', partyLedgerData.total_debit, partyLedgerData.total_credit, partyLedgerData.closing_balance]
    ];
  }

  /**
   * Get final sheet header
   */
  getSheetHeader(header: any, body: any) {
    if (header.length === 0) {
      return this.getHeaderFromData(body);
    }
    if (header instanceof Array) {
      return header;
    }
    // Convert to array if the header is an object.
    return Object.keys(header);
  }


  /**
   * Download sheet for given headers & data
   * @param sheetName string
   * @param header any[]
   * @param body any[]
   */
  download(sheetName: string, header: any[] = [], body: any[], calculateTotal = true, report_Info: ReportInfo[][] = []) {
    this.dataStartingPoints = [];
    const workbook = new Excel.Workbook();

    // Add a worksheet
    const sheet = workbook.addWorksheet(sheetName);

    header = this.getSheetHeader(header, body);

    const reportInfo: ReportInfo[][] = report_Info;

    // Define columns/headers
    this.setSheetHeaders(header, sheet, this.HEADER_POSITION + report_Info.length + (report_Info.length > 0 ? 1 : 0));

    this.setCompanyDetails(sheet);
    this.setReportMetaDetails(sheet);
    // Display data
    sheet.addRows(this.setExcelData(body, header, this.HEADER_POSITION + report_Info.length + (report_Info.length > 0 ? 1 : 0)));

    this.setReportInfo(sheet, reportInfo);

    if (calculateTotal) {
      this.calculateRecords(sheet, this.dataStartingPoints);
    }

    // Write excel file.
    workbook.xlsx.writeBuffer().then(function (data) {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, sheetName + '.xlsx');
    });
  }

  /**
   * Transform records, apply formatting to label rows if there is any.
   * @param sheet any
   * @param dataStartingPoints DataPoints[]
   */
  calculateRecords(sheet: any, dataStartingPoints: DataPoints[]) {
    dataStartingPoints.map((dataPoint: DataPoints) => {
      let numberedCells = [];

      const currentRow = sheet.getRow(dataPoint.start);
      const labelRow = dataPoint.label ? sheet.getRow(dataPoint.start - 1) : '';

      if (dataPoint.label && labelRow) {
        this.fillColor(labelRow, 'pattern', 'solid',
          { argb: this.LABEL_COLORS[dataPoint.label] ? this.LABEL_COLORS[dataPoint.label] : this.DEFAULT_ROW_COLOR });
      }
      if (currentRow.model) {
        numberedCells = this.transformNumberedCellFromRow(currentRow, dataPoint, sheet);
      }
    });
  }


  /**
   * Set details such as report date & time.
   * @param sheet any
   */
  setReportMetaDetails(sheet: any) {
    const reportMetaDetails: any[] = this.reportConfig.exceljs.metaDetails.label.richText;
    reportMetaDetails.map((meta: any, index: number) => reportMetaDetails[index].text = this.parseCommand(meta.text));

    sheet.getCell('E' + this.reportMetaDetailRowPosition).value = {
      'richText': reportMetaDetails
    };
  }

  /**
   * Set company details
   * @param sheet any
   */
  setCompanyDetails(sheet: any) {
    (sheet.getRow(1).model.cells as CellType[]).map((cell: CellType) => {
      sheet.getCell(cell.address).value = '';
    });

    this.setCompanyDetailCells(sheet, 'A1', 'C1', this.reportConfig.exceljs.companyDetails.label.label1, true);
    this.setCompanyDetailCells(sheet, 'A2', 'C2', this.reportConfig.exceljs.companyDetails.label.label2);
    this.setCompanyDetailCells(sheet, 'A3', 'C3', this.reportConfig.exceljs.companyDetails.label.label3);
    this.setCompanyDetailCells(sheet, 'A4', 'C4', this.reportConfig.exceljs.companyDetails.label.label4);
  }

  setCompanyDetailCells(sheet: any, firstCell: string, lastCell: string, label: string, bold = false) {
    sheet.getCell(firstCell).value = bold ? {
      'richText': [{
        'font': {
          'bold': true
        },
        'text': label
      }]
    } : label;

    sheet.getCell(firstCell).alignment = {
      horizontal: this.reportConfig.exceljs.companyDetails.label.alignment.horizontal,
      vertical: this.reportConfig.exceljs.companyDetails.label.alignment.vertical
    };
    sheet.mergeCells(`${firstCell}:${lastCell}`);
  }

  /**
   * Apply formula to numbered cells
   * @param numberedCells CellType
   * @param endPoint number
   * @param sheet any
   */
  applyFormulaToNumberedCells(numberedCells: CellType, endPoint: number, sheet: any) {
    if (!numberedCells || !sheet) {
      return;
    }

    const cellAddress: string = numberedCells.address;
    const alphaAddress = this.getAlphabeticalAddress(cellAddress);

    sheet.getCell(`A${endPoint + 1}`).value = 'Total:';
    sheet.getRow(endPoint + 1).font = {
      bold: true,
      underline: 'single'
    };

    sheet.getCell(`${alphaAddress}${endPoint + 1}`).value = {
      formula:
        `SUM(${cellAddress}:${alphaAddress}${endPoint})`
    };
  }

  /**
   * Get Alphabetical Address
   * @param address string
   */
  getAlphabeticalAddress(address: string) {
    return address.replace(/[^a-zA-Z]+/gm, '');
  }

  /**
   * Set Sheet Headers
   * @param header any[]
   * @param sheet any
   */
  setSheetHeaders(header: any[], sheet: any, header_position: number = this.HEADER_POSITION) {
    const sheetColumns = [];

    const newHeaders = [];

    header.map((headerText: string) => {
      const formattedHeader = this.setHeaderLabel(headerText);
      newHeaders.push(formattedHeader);
      const defaultWidth = 15;
      const wid = formattedHeader.length * 1.5 < defaultWidth ? defaultWidth : formattedHeader.length * 1.5;
      sheetColumns.push({ header: formattedHeader, key: formattedHeader, width: wid });
    });

    // Set columns
    sheet.columns = sheetColumns;

    // Set headers in 8th row.
    const headerRow = sheet.getRow(header_position);

    headerRow.values = newHeaders;
    // tslint:disable-next-line:no-shadowed-variable
    headerRow._cells.forEach((v, k, headerRow) => {
      headerRow[k].fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.DEFAULT_ROW_COLOR }
      };

      if (this.doNotCalculateArray.indexOf(headerRow[k].value) > -1) {
        this.doNotCalculateColumn.push(headerRow[k]._column.letter);
      }
    }, this);
    // this.fillColor(headerRow, 'pattern', 'solid', { argb: this.DEFAULT_ROW_COLOR });
  }

  /**
   * Set excel data
   * @param body any[]
   * @param headers any[]
   */
  setExcelData(body: any[], headers: any[], header_position: number = this.HEADER_POSITION) {
    const bodyKeys: string[] = Object.keys(body);
    const finalExcelData = [];

    let tempDataPoint = header_position;

    if (bodyKeys.length > 0) {
      if (isNaN(+bodyKeys[0])) {
        bodyKeys.map((key: string) => {

          if (body[key].length > 0) {

            // Create labels if any
            ++tempDataPoint;
            finalExcelData.push([this.titleCase.transform(key)]);

            const dataPoint: DataPoints = { start: tempDataPoint, end: tempDataPoint };

            // Create formatted rows
            const formattedRows: any[] = this.createFormattedRows(body[key]);
            formattedRows.map((formattedRow: any[], index: number) => {
              finalExcelData.push(formattedRow); ++tempDataPoint;
              if (index === 0) {
                dataPoint.start = tempDataPoint;
              }
            });

            dataPoint.label = key;
            dataPoint.end = tempDataPoint;
            this.dataStartingPoints.push(dataPoint);
            tempDataPoint += 2;
            finalExcelData.push([], []);
          }
          // Create empty row
        });
        return finalExcelData;
      } else {

        const dataPoint: DataPoints = { start: tempDataPoint, end: tempDataPoint };
        const formattedRows: any[] = this.createFormattedRows(body);
        // Create formatted rows
        formattedRows.map((formattedRow: any[], index: number) => {
          finalExcelData.push(formattedRow); ++tempDataPoint;
          if (index === 0) {
            dataPoint.start = tempDataPoint;
          }
        });

        dataPoint.end = tempDataPoint;
        this.dataStartingPoints.push(dataPoint);

        return finalExcelData;
      }
    }

  }

  /**
   * Create excel compatible rows.
   * @param rows any[]
   */
  createFormattedRows(rows: any[]) {
    const formattedRows = [];

    if (rows.length === 0) {
      return [[]];
    }

    rows.map((row: any) => {
      const newRow = [];
      Object.keys(row).map((column: string) => {
        newRow.push(row[column]);
      });
      formattedRows.push(newRow);
    });
    return formattedRows;
  }

  /**
   * Fill color in a row or cell
   * @param object any
   * @param type string
   * @param pattern string
   * @param fgColor {argb: string}
   */
  fillColor(object: any, type: string, pattern: string, fgColor: { argb: string }) {
    object.fill = {
      type: type,
      pattern: pattern,
      fgColor: fgColor
    };
  }

  /**
   * Get numbered cell from row
   * @param row any
   * @param dataPoint DataPoints
   * @param sheet any
   */
  transformNumberedCellFromRow(row: any, dataPoint: DataPoints, sheet: any) {
    return row.model.cells.map((cell: CellType) => {
      if (cell.type === 2 && this.doNotCalculateColumn.indexOf(cell.address.replace(/[0-9]/g, '')) === -1) {
        this.applyFormulaToNumberedCells(cell, dataPoint.end, sheet);
      }
    });
  }

  /**
   * Set header label
   * @param headerText string
   */
  setHeaderLabel(headerText: string) {
    if (this.reportConfig.column_labels[headerText] && this.reportConfig.column_labels[headerText].label) {
      return this.reportConfig.column_labels[headerText].label;
    }

    return this.readableKey.transform(headerText);
  }

  /**
   * Set report info
   * @param sheet any
   * @param info ReportInfo[][]
   */
  setReportInfo(sheet: any, info: ReportInfo[][]) {

    if (info.length === 0) {
      return;
    }

    let metaRowPosition = this.HEADER_POSITION;

    info.map((reportInfo: ReportInfo[], index: number) => {
      reportInfo.map((rinfo: ReportInfo, row: number) => {
        if (row > 12) { return; }
        const column = String.fromCharCode(65 + (row * 2));
        sheet.getCell(`${column}${metaRowPosition}`).value = {
          richText: [
            {
              font: {
                bold: true,
                size: '10'
              },
              text: rinfo.key + ': '
            },
            {
              font: {
                bold: false,
                size: '10'
              },
              text: rinfo.value
            }
          ]
        };
      });
      metaRowPosition++;
    });
  }

}
