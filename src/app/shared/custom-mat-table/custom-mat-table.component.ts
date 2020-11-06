import {Component, Input, Output, ViewChild, OnChanges, SimpleChange, EventEmitter} from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-mat-table',
  templateUrl: './custom-mat-table.component.html',
  styleUrls: ['./custom-mat-table.component.scss']
})

/**
 * Custom material table component
 * Note:- Needs refactoring
 */
export class CustomMatTableComponent implements OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input()
  dataSource: any = [];

  @Input()
  dataColumns: any = [];

  @Input()
  pagination = true;

  @Output()
  OnUpdate: EventEmitter<any> = new EventEmitter<any>(true);

  pageLength: number;

  pageLengths = [10, 20, 50];

  customDataSource = new MatTableDataSource<any>([]);

  displayColumns = [];

  initialize = false;

  /**
   * Set page length
   */
  constructor() {
    this.pageLength = this.pageLengths[0];
  }

  /**
   * Set table once datasource and columns are initialized
   * @param changes any
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName) && propName === 'dataSource') {
        const changedProp = changes[propName];
        const to = JSON.stringify(changedProp.currentValue);
        if (!changedProp.isFirstChange()) {
          this.displayColumns = this.getColumns();
          this.customDataSource = new MatTableDataSource<any>(JSON.parse(to));
          this.customDataSource.paginator = this.paginator;
        }
      }
    }
  }

  getRouteParameter(element, displayColumn) {
    const data = {};
    data[displayColumn.actionKey] = element[displayColumn.actionKey];
    return data;
  }

    getRouteParameterWithName(element, displayColumn) {
        const data = {};
        data[displayColumn.actionKey] = element[displayColumn.actionKey];
        data['name'] = element['name'];
        return data;
    }
  /**
   * Filter table data
   * @param filterValue string
   */
  applyFilter(filterValue: string) {
    this.customDataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Get columns
   */
  getColumns() {
    return this.dataColumns.map(column => column.key);
  }

  /**
   * Change page length
   */
  changePageLength(event) {
    console.log(event,this.pageLength);
    if (this.pageLength) {
      this.customDataSource.paginator._changePageSize(this.pageLength);
    }
  }

  update(id, status) {
        this.OnUpdate.emit({ 'id': id, 'status': status});
   }

}
