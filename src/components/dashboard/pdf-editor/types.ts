
export type PDFTool = 
  | 'select' 
  | 'edit-text' 
  | 'add-text' 
  | 'insert-image' 
  | 'draw' 
  | 'shape-rect' 
  | 'shape-circle' 
  | 'shape-line'
  | 'highlight' 
  | 'underline' 
  | 'strikethrough' 
  | 'comment'
  | 'signature'
  | 'form-field'
  | 'link'
  | 'redact'
  | 'whiteout';

/**
 * AJN PDF Element Schema - Industrial 2026
 * Defines editable object properties for high-performance surgical layers.
 */
export interface PDFElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'signature' | 'form-field' | 'link' | 'whiteout' | 'path';
  shapeType?: 'rect' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string; // Text or Stroke color
  fillColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  opacity?: number;
  rotation?: number;
  zIndex: number;
  textAlign?: 'left' | 'center' | 'right';
  
  // Signature specific
  signatureType?: 'draw' | 'type' | 'upload';
  signatureData?: string; 
  
  // Form field specific
  fieldType?: 'text' | 'checkbox' | 'radio' | 'dropdown';
  fieldPlaceholder?: string;
  isRequired?: boolean;
  
  // Link specific
  url?: string;

  // Path data for drawing/highlighting
  pathData?: string;
  isHighlighter?: boolean;
}

export interface PDFPage {
  id: string;
  pageNumber: number;
  rotation: number;
  elements: PDFElement[];
  isScanned?: boolean;
  previewUrl?: string; 
}

export interface PDFVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  editorName: string;
  summary: string;
}

export interface PDFDocument {
  id: string;
  name: string;
  totalPages: number;
  pages: PDFPage[];
  versions: PDFVersion[];
}
