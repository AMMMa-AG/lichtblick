import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import jsonData from '../../assets/visual/index.json';

export class MarkerNodeBase {
  constructor(public title: string) {
  }

  accept(visitor: MarkerVisitor) {
    visitor.onVisit(this);
  }
}

export class MarkerNode extends MarkerNodeBase {
  nodes: MarkerNode[] = [];
  entries: MarkerEntry[] = [];

  constructor(public dataSource: MarkerDataSource, public title: string) {
    super(title);
  }

  add(node: MarkerNodeBase) {
    if (node instanceof MarkerNode) {
      if (this.entries.length)
        throw new Error("cannot mix nodes");
      this.nodes.push(node);
    } else if (node instanceof MarkerEntry) {
      if (this.nodes.length)
        throw new Error("cannot mix nodes");
      this.entries.push(node);
    } else {
      throw new Error("invalide node");
    }
  }
}

export class MarkerEntry extends MarkerNodeBase {
  nodes: MarkerNode[] = [];
  entries: MarkerNode[] = [];

  constructor(public title: string, public fileName: string, public image: string) {
    super(title);
  }
}

export class MarkerVisitor {
  constructor(public visitMarkerNode: Function, public visitMarkerEntry: Function) {
  }

  onVisit(node) {
    if (node instanceof MarkerNode) {
      if (this.visitMarkerNode) this.visitMarkerNode(node);
    } else if (node instanceof MarkerEntry) {
      if (this.visitMarkerEntry) this.visitMarkerEntry(node);
    } else {
      throw new Error("invalid node");
    }
  }
}

export class MarkerDataSource {
  root: MarkerNode;
  allEntries: MarkerEntry[] = [];
  pathByNode: Map<MarkerNode, string> = new Map();
  nodeByPath: Map<string, MarkerNode> = new Map();
  entryById: Map<string, MarkerEntry> = new Map();

  constructor(private data) {
    this.root = new MarkerNode(this, "Visuelle Marker");
    this.pathByNode.set(this.root, this.root.title);
    this.nodeByPath.set(this.root.title, this.root);
    data.index.marker.forEach((item) => this.processMarkerNode(this.root, item));
  }

  processMarkerNode(parent: MarkerNode, elem) {
    let node = new MarkerNode(this, elem.name);
    parent.add(node);

    let path = this.pathByNode.get(parent) + "/" + node.title;
    this.pathByNode.set(node, path);
    this.nodeByPath.set(path, node);


    if (elem.marker)
      elem.marker.forEach((child) => this.processMarkerNode(node, child));

    if (elem.entry)
      elem.entry.forEach((child) => this.processMarkerEntry(node, child));
  }

  processMarkerEntry(node: MarkerNode, elem) {
    let entry = new MarkerEntry(elem.name, elem.lex, elem.image);
    node.add(entry);
    this.entryById.set(entry.image, entry);
    this.allEntries.push(entry);
  }

  getPath(node: MarkerNode) {
    return this.pathByNode.get(node);
  }

  getNode(path: string) {
    return this.nodeByPath.get(path);
  }

  getById(id: string) {
    return this.entryById.get(id);
  }

  getCategories(): string[] {
    return this.data.index.marker.map(item => item.name);
  }
}

export interface LexData {
  title: string;
  html: string;
}

@Injectable()
export class VisualMarkerProvider {
  dataSource: MarkerDataSource;
  categories: number[];

  constructor(private http: HttpClient) {
    this.dataSource = new MarkerDataSource(jsonData);
  }

  filter(categories: number[]) {
    if (!(categories && categories.length)) return;
    this.categories = categories;
    this.dataSource.root.nodes = this.dataSource.root.nodes.filter((item, index) => {
      return categories.indexOf(index) >= 0;
    });
  }

  getEditDataSource(): MarkerDataSource {
    const dataSource = new MarkerDataSource(jsonData);
    if (this.categories) {
      dataSource.root.nodes = dataSource.root.nodes.filter((item, index) => {
        return this.categories.indexOf(index) >= 0;
      });
    }
    return dataSource;
  }

  resolveMarker(id: string): MarkerEntry {
    return this.dataSource.getById(id);
  }

  resolveEntryImage(entry: MarkerEntry): string {
    let image = entry.image || '';
    if (!image.includes('.'))
      image = image + '.svg';
    return 'assets/visual/' + image;
  }

  resolveMarkerImage(id: string) {
    return this.resolveEntryImage(this.resolveMarker(id));
  }

  getLex(fileName: string): Promise<LexData> {
    return new Promise(resolve => {
      this.http.get('assets/lex/' + fileName, { responseType: 'text' })
        .subscribe(data => {
          let res = data.match(/<title>([\s\S]*?)<\/title>/i);
          let title = res ? res[1] : '';

          res = data.match(/<body>([\s\S]+?)<\/body>/i);
          let html = res ? res[1] : '';
          html = html.replace(/src="Images/gi, 'src="assets/lex/Images');

          resolve({ title, html });
        });
    });
  }
}
