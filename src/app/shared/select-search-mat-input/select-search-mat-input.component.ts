import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { Component, OnInit, ViewChild, Input, forwardRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-select-search-mat-input',
  templateUrl: './select-search-mat-input.component.html',
  styleUrls: ['./select-search-mat-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchMatInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSearchMatInputComponent implements OnInit, ControlValueAccessor {
  @Input()
  listData: any;

  @Input()
  placeholder: String = 'Select Option';

  @Input()
  allOptAvail: boolean = true;

  @Input()
  allOptValue = 'all';

  filteredListData: any;

  @ViewChild('customMatSelect') selectElem: MatSelect;

  @Input()
  searchBy: any[];

  @Input()
  ddOption: '';

  @Input() label = 'switch';
  @Input('value') _value = false;
  onChange: any = () => { };
  onTouched: any = () => { };

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  constructor() { }

  ngOnInit() {
    this.filteredListData = this.listData;
  }

  setData(data: any) {
    this.filteredListData = this.listData = data;
  }

  getFilteredData(filterData) {
    this.filteredListData = this.listData.filter((data: any) => {
      let str = '';
      this.searchBy.forEach((key: any) => {
        if (!!data[key]) {
          str += data[key].toLowerCase();
        }
      });
      return str.includes(filterData.toLowerCase());
    });
    this.scrollCustomMatTop();
  }

  scrollCustomMatTop() {
    const panel = this.selectElem.panel.nativeElement;
    panel.addEventListener('scroll', (event) => event.target.scrollTop = 0);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }

  selectVal() {
    this.value = this.selectElem.value;
  }

}
