declare var google: any;

export class CustomMarker extends google.maps.OverlayView {
  constructor(latlng, map, imageSrc, state, title = 'ok', includeInfoWindow = true) {
    super();
    this.latlng_ = latlng;
    this.imageSrc = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
    this.state = state;
    this.title = title;
    this.infoWindow = includeInfoWindow ? new google.maps.InfoWindow() : null;
  }

  draw() {
    var div = this.div_;
    if (!div) {
      // Create a overlay text DIV
      div = this.div_ = document.createElement('div');
      // Create the DIV representing our CustomMarker
      div.className = 'customMarker';
      switch (this.state) {
        case 'inactive':
          div.classList.add('customMarker', 'inactive-marker');
          break;
        case 'available':
          div.classList.add('customMarker', 'available-marker');
          break;
        case 'unavailable':
          div.classList.add('customMarker', 'unavailable-marker');
          break;
        default:
          div.classList.add('customMarker', 'active-marker');
      }

      var img = document.createElement('img');
      img.src = this.imageSrc;
      div.appendChild(img);
      div.addEventListener('click', (event) => {
        console.log(this.title);
      });

      google.maps.event.addDomListener(div, 'click', () => {
        if (this.infoWindow) {
          this.openInfoWindow();
        }
      });

      // Then add the overlay to the DOM
      var panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }

    // Position the overlay
    var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      div.style.left = point.x + 'px';
      div.style.top = point.y + 'px';
    }
  }

  remove() {
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  }

  getPosition() {
    return this.latlng_;
  }

  openInfoWindow() {
    if (!this.infoWindow) return;
    // Aquí puedes pasar el HTML personalizado o cualquier contenido que desees mostrar en el infoventana
    const content = `
      <div class="info-window-content">
        <h3>${this.title}</h3>
        <p>state: !row.connected
        ? 'inactive'
        : row.availability === 1
        ? 'available'
        : row.availability === 2
        ? 'unavailable'
        : 'unavailable'</p>
      </div>
    `;

    this.infoWindow.setContent(content);
    this.infoWindow.open(this.getMap(), this);
  }
}
