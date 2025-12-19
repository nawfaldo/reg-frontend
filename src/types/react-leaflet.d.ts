declare module 'react-leaflet' {
  import { Component } from 'react';
  import { MapOptions, TileLayerOptions, FeatureGroupOptions } from 'leaflet';

  export class MapContainer extends Component<any> {}
  export class Map extends Component<any> {}
  export class TileLayer extends Component<any> {}
  export class FeatureGroup extends Component<any> {}
  export class Marker extends Component<any> {}
  export class Popup extends Component<any> {}
  export class Circle extends Component<any> {}
  export function useMap(): any;
}

declare module 'react-leaflet-draw' {
  import { Component } from 'react';

  export interface EditControlProps {
    position?: string;
    onCreated?: (e: any) => void;
    onEdited?: (e: any) => void;
    onDeleted?: (e: any) => void;
    onDrawStart?: (e: any) => void;
    onDrawStop?: (e: any) => void;
    onEditStart?: (e: any) => void;
    onEditStop?: (e: any) => void;
    onDeleteStart?: (e: any) => void;
    onDeleteStop?: (e: any) => void;
    draw?: any;
    edit?: any;
    remove?: any;
  }

  export class EditControl extends Component<EditControlProps> {}
}

