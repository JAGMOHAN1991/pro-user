import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss']
})
export class ContentHeaderComponent implements OnInit {

  @Input()
  icon: any;

  @Input()
  title: any;

  @Input()
  subtitle: any;

  @Input()
  desc: any;

  @Input()
  hideBreadcrumb: Boolean = false;

  @Input()
  hasBgImage: Boolean = false;

  @Input()
  class: any;

  @Input()
  pwLogo: Boolean = false;


  @Input()
  pwShortLogo: Boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

}
