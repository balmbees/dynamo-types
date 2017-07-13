import * as Attribute from './attribute';

export interface Metadata {
  readonly name: string; // Name of index
  readonly hashAttribute: Attribute.Metadata;
  readonly rangeAttribute?: Attribute.Metadata;
}

export interface HashPrimaryKeyMetadata {
  readonly type: 'HASH';
  readonly hash: Attribute.Metadata;
}

export interface FullPrimaryKeyMetadata {
  readonly type: 'FULL';
  readonly hash: Attribute.Metadata;
  readonly range: Attribute.Metadata;
}
