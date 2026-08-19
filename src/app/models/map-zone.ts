export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface PolygonMapZone {
  type: 'polygon';
  points: MapPoint[];
}

export interface CircleMapZone {
  type: 'circle';
  center: MapPoint;
  radiusMeters: number;
}

export type MapZone = PolygonMapZone | CircleMapZone;
