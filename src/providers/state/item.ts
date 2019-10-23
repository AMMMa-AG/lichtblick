export interface Item {
  uid: number,
  index: number;
  title: string,
  text: string,
  visualAnnotations: number
}

export interface SegmentItem extends Item {
  captureUrl: string,
  startTime: number,
  endTime: number,
  markers: string[]
}
