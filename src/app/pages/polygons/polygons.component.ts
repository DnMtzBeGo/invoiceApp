import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { CreatePolygonComponent } from './components/create-polygon/create-polygon.component';
// import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet-draw';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { Router } from '@angular/router';

interface Action {
  label: string;
  id: string;
  icon: string;
}

@Component({
  selector: 'app-polygons',
  templateUrl: './polygons.component.html',
  styleUrls: ['./polygons.component.scss']
})
export class PolygonsComponent implements OnInit {
  private map: any;
  private drawnItems: any;
  public headerTransparent: boolean = true;
  public drawControl: any;
  public showFleetMap = true;
  public showModal: boolean = true;

  //// Variables Moddal create Polygon
  backdrop: boolean = true;
  icon: string = 'begon-polygon';
  langmodal = {
    done: 'Awesome'
  };

  simple = {
    title: 'Polygon created correctly',
    subtitle: 'Your Polygon has been created correctly on the map and has been added to filters.'
  };

  //////// Variables fot Bego Table

  public lang = {
    selected: 'en',
    paginator: {
      total: '',
      totalOf: '',
      nextPage: '',
      prevPage: '',
      itemsPerPage: ''
    },
    filter: {
      input: '',
      selector: ''
    }
  };

  public columns: any[] = [
    { id: 'name', label: '', filter: 'input' },
    { id: 'date_created', label: '' }
  ];

  public actions: Action[];

  public page = { size: 0, index: 0, total: 0 };

  public searchQueries = {
    limit: 10,
    page: 1,
    // sort: JSON.stringify({ date_created: -1 }),
    match: ''
  };

  public selectRow: any = {
    showColumnSelection: false,
    selectionLimit: 0,
    keyPrimaryRow: 'name'
  };

  public polygons = [];

  public loadingData: boolean = true;

  //////// Variables fot Bego Table

  constructor(
    private readonly router: Router,
    private webService: AuthService,
    private translateService: TranslateService,
    private dialog: MatDialog, // private datePipe: DatePipe,
    public readonly primeService: PrimeService
  ) {
    this.lang.selected = localStorage.getItem('lang') || 'en';

    this.setLang();
  }

  async ngOnInit() {
    if (this.primeService.loaded.isStopped) {
      this.handleMustRedirect();
    } else {
      this.primeService.loaded.subscribe(() => this.handleMustRedirect());
    }

    this.translateService.onLangChange.subscribe(async ({ lang }) => {
      this.lang.selected = lang;
      this.setLang();
      console.log('translate: ', lang);
      await this.getPolygons(true);
    });

    this.page.size = this.searchQueries.limit;
    this.page.index = this.searchQueries.page;
    await this.getPolygons();

    this.initializeMap();

    // setTimeout(() => {
    //   this.showFleetMap = false;
    // }, 2000);
  }

  handleMustRedirect() {
    if (!this.primeService.isPrime) this.router.navigate(['/home']);
  }

  private initializeMap(): void {
    // Crea el mapa
    var center = [19.566321, -99.211206];

    // Create the map
    this.map = L.map('map', {
      zoomControl: true,
      maxZoom: 21,
      attributionControl: false
    }).setView(center, 5);

    // Desactiva los controles de zoom por defecto
    this.map.zoomControl.remove();

    L.control
      .zoom({
        position: 'bottomleft'
      })
      .addTo(this.map);

    // Añade la capa base (puedes cambiar el proveedor de mapa según necesites)
    L.tileLayer('http://{s}.google.com/vt/lyrt=t,h&x={x}&y={y}&z={z}', {
      maxZoom: 30,
      subdomains: ['mt0', 'mt1']
    }).addTo(this.map);

    // Crea una capa para los elementos dibujados
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    var options = {
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false, // Restricts shapes to simple polygons
          drawError: {
            color: '#ffee00', // Color the shape will turn when intersects
            message: "<strong>Oh snap!<strong> you can't draw that!" // Message that will show when intersect
          },
          shapeOptions: {
            color: '#ffee00'
          }
        },
        polyline: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: false,
        circlemarker: false
      }
    };

    this.drawControl = new L.Control.Draw(options);
    this.map.addControl(this.drawControl);

    this.map.on(L.Draw.Event.CREATED, (e) => {
      var layer = e.layer;
      this.drawnItems.addLayer(layer);
    });

    // Maneja los eventos de dibujo
    this.map.on('draw:created', (event: any) => {
      var data = this.drawnItems.toGeoJSON();
      console.log(data);
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      this.openModalCreation(data, 'create');
    });
  }

  async getPolygons(translated?: boolean) {
    this.loadingData = true;

    if (translated) this.polygons = [];

    const { limit, page, match } = this.searchQueries;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      // ...(sort && { sort }),
      ...(match && { match })
    }).toString();

    (await this.webService.apiRestGet(`polygons/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        console.log(result);
        this.page.total = total;
        this.polygons = result.map((polygons) => {
          let due_date: any = {
            value: '-',
            style: {
              color: '#FFFFFF',
              'font-weight': 700
            }
          };

          const actions = {
            enabled: true,
            options: {
              rename: true,
              edit: false,
              delete: true
            }
          };

          actions.enabled = Object.values(actions.options).includes(true);
          console.log(polygons);
          return {
            ...polygons,
            actions
          };
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
      }
    });
  }

  // Translate Bego Table
  translate(word: string, type: string) {
    return this.translateService.instant(`polygons.${type}.${word}`);
  }

  sortingTable({ type, asc }: any) {
    // this.searchQueries.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQueries.page = 1;
    this.getPolygons();
  }

  changingPage({ index, size }: any) {
    this.searchQueries.page = index;
    if (this.searchQueries.limit !== size) {
      this.page.index = 1;
      this.searchQueries.page = 1;
    }
    this.searchQueries.limit = size;
    this.getPolygons();
  }

  handleReload(event: any) {
    if (event === 'reloadTable') {
      this.getPolygons();
    }
  }

  filterData({ active, search, type }) {
    if (active) {
      this.searchQueries.match = JSON.stringify({ [type]: search });
    } else this.searchQueries.match = '';
    this.page.index = 1;
    this.searchQueries.page = 1;
    this.getPolygons();
  }

  clickReload() {
    this.getPolygons();
  }

  selectColumn(event) {
    if (event?.column?.id === 'rename') {
      // this.openViewVouchersModal(allDocVocuchers);
    }
    if (event?.column?.id === 'edit') {
      // this.openMessageModal(event?.element);
    }
    if (event?.column?.id === 'delete') {
      // this.openMessageModal(event?.element);
    }
  }

  selectingAction({ type, data }: any) {
    switch (type) {
      case 'rename':
        this.openModalCreation(data, 'rename');
        break;
      case 'edit':
        // this.openFile(data, 'xml');
        break;
      case 'delete':
        this.openModalCreation(data, 'delete');
        break;
    }
  }

  setLang() {
    this.lang = {
      ...this.lang,
      paginator: {
        total: this.translate('total', 'paginator'),
        totalOf: this.translate('of', 'paginator'),
        nextPage: this.translate('nextPage', 'paginator'),
        prevPage: this.translate('prevPage', 'paginator'),
        itemsPerPage: this.translate('itemsPerPage', 'paginator')
      },
      filter: {
        input: this.translate('input', 'filter'),
        selector: this.translate('selector', 'filter')
      }
    };

    this.columns.forEach((column) => (column.label = this.translate(column.id, 'table')));

    // Bego Table Actions
    this.actions = [
      {
        label: this.translate('rename', 'actions'),
        id: 'rename',
        icon: 'edit'
      },
      {
        label: this.translate('edit', 'actions'),
        id: 'edit',
        icon: 'exchange'
      },
      {
        label: this.translate('delete', 'actions'),
        id: 'delete',
        icon: 'trash1'
      }
    ];
  }

  public openPolygonMap() {
    this.showFleetMap = false;
    // Check if drawing for polygons is enabled and if so, simulate a click to start drawing
    if (this.drawControl) {
      // New Leaflet versions require a slightly different approach, ensure this is compatible with your version
      let toolbar = this.drawControl._toolbars.draw; // Get the draw toolbar
      if (toolbar && toolbar._modes && toolbar._modes.polygon) {
        toolbar._modes.polygon.handler.enable(); // Start polygon drawing mode
      }
    }
  }

  private async createPolygons(name, geometry) {
    geometry.features = geometry.features.slice(-1);

    let createPolygonRequest = {
      name,
      geometry
    };

    (await this.webService.apiRest(JSON.stringify(createPolygonRequest), 'polygons', { apiVersion: 'v1.1' })).subscribe(
      (res) => {
        this.drawnItems.clearLayers();
        this.showFleetMap = true;
        this.handleReload('reloadTable');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // MODALS
  public openModalCreation(data, action): void {
    const dialogRef = this.dialog.open(CreatePolygonComponent, {
      data: { ...data, action }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.action === 'create') {
        this.createPolygons(result.name, data);
        this.drawnItems.clearLayers();
      }

      if (result.action === 'rename') {
        this.polygons = this.polygons.map((polygon) => ({
          ...polygon,
          ...(polygon._id === data._id && { name: result.name })
        }));
      }

      if (result.action === 'delete') {
        this.polygons = this.polygons.filter((polygon) => polygon._id !== data._id);
      }
    });
  }
}
