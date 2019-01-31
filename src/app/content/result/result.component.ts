import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MetaData } from './metaData.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import { take } from 'rxjs/operators';



@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ResultComponent implements OnInit {
  isPanelOpen = false;
  isReady = false;
  displayedColumns: string[] = ['name', 'favorite', 'love', 'views', 'remixtreeCount'];
  dataSource =  new MatTableDataSource();
  expandedElement = null;
  imageUrl: string;
  projectUrl: string;
  rootUrl: string;
  currentDataScource = 'ROOT_DATA';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('dataSourceSwitcher') dataSourceSwitcher;
  constructor(private httpClient: HttpClient, private bottomSheet: MatBottomSheet) { }
  ngOnInit() {
    this.switchDataSource('ROOT_DATA');
  }

  openBottomSheet() {
    this.bottomSheet.open(this.dataSourceSwitcher, {hasBackdrop: false});
  }

  selectDataSource(value) {
    this.switchDataSource(value);
    this.bottomSheet.dismiss();
  }

  getScratchData(data) {
    this.isReady = false;
    const projectId = data.currentAddress.split('/')[2];
    this.imageUrl = `https://cdn2.scratch.mit.edu/get_image/project/${projectId}_200x200.png`;
    this.projectUrl = `https://scratch.mit.edu/projects/${projectId}/`;
    this.rootUrl = data.rootProjectAddress === 'root' ? '本專案為根專案' : `https://scratch.mit.edu/projects/${data.rootProjectAddress.split('/')[2]}/`;
    setTimeout(() => this.isReady = true, 700);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  togglePanel(panelState) {
    this.isPanelOpen = panelState;
  }

  switchDataSource(sourceType) {
    this.currentDataScource = sourceType;
    const sourceAddress = sourceType === 'ROOT_DATA' ? './assets/root_Data.json'
      : sourceType === 'LIKE_DATA' ? './assets/love_data.json'
      : sourceType === 'VIEW_DATA' ? './assets/favorite_data.json'
      : sourceType === 'FAVORITE_DATA' ? './assets/views_data.json'
      : '';

    this.httpClient.get(sourceAddress).pipe(take(1))
        .subscribe(
          (data: MetaData[]) => {
            const ELEMENT_DATA: MetaData[] = data;
            this.dataSource = new MatTableDataSource(ELEMENT_DATA);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          },
          (err: HttpErrorResponse) => {
            console.log (err.message);
          }
      );
  }

}
