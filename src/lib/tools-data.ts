import { 
  Layout, 
  Shrink, 
  FileText, 
  Scissors, 
  Maximize, 
  Presentation, 
  FileSpreadsheet, 
  LayoutGrid, 
  Trash2, 
  RotateCw, 
  Crop, 
  ImageIcon, 
  Stamp, 
  Code2, 
  FileDigit, 
  FileArchive, 
  FileEdit, 
  Plus, 
  ShieldCheck, 
  Wrench, 
  Search, 
  FileCode, 
  Wand2, 
  Smartphone, 
  ArchiveRestore, 
  Accessibility, 
  FileJson,
  BrainCircuit,
  Type,
  PenTool,
  Captions,
  Repeat,
  Unlock,
  Lock,
  Sparkles,
  TabletSmartphone,
  Layers,
  Image as LucideImage,
  Split,
  Table,
  BookOpen,
  FileBox,
  Binary,
  Tag,
  Smile,
  LucideIcon
} from 'lucide-react';

export interface FAQ {
  q: string;
  a: string;
}

export interface ServiceTool {
  id: string;
  name: string;
  desc: string;
  longDesc: string;
  icon: LucideIcon;
  tag: string;
  cat: 'pdf' | 'img' | 'ai';
  mode: 'PDF' | 'Image' | 'AI';
  badge?: 'Popular' | 'Smart' | 'New';
  color: string;
  perfIndex: string;
  benefits: string[];
  useCases: string[];
  instructions: string[];
  keywords: string[]; 
  faqs: FAQ[];
}

/**
 * AJN Master 57-Tool Registry
 * Industrial standard v16.0
 */
export const ALL_TOOLS: ServiceTool[] = [
  // --- PDF CORE ---
  { 
    id: 'merge-pdf-online', 
    name: 'Merge PDF', 
    desc: 'Combine multiple PDF files into one easily.', 
    longDesc: 'Our Merge PDF tool is a professional-grade document assembly unit designed to join two or more PDF files into a single document. Most operations are processed locally in your browser for maximum privacy.',
    icon: Layout, tag: 'merge', cat: 'pdf', mode: 'PDF', badge: 'Popular', color: 'text-blue-500', perfIndex: 'Fast',
    benefits: ["Hybrid Local/Cloud Processing", "Unlimited Multi-File Ingestion", "No Account Sign-up Required"],
    useCases: ["Merging Government ID Front/Back", "Combining Tax Documents"],
    instructions: ["Upload files", "Reorder", "Click Merge", "Download"],
    keywords: ["merge pdf online", "combine pdf files"],
    faqs: [{ q: "Is there a limit?", a: "No, merge as many as you need." }]
  },
  { 
    id: 'split-pdf-online', 
    name: 'Split PDF', 
    desc: 'Cut your PDF into smaller parts or extract pages.', 
    longDesc: 'The Split PDF tool offers surgical precision for document decomposition. Isolate specific page ranges or extract individual pages into separate files.',
    icon: Scissors, tag: 'split', cat: 'pdf', mode: 'PDF', badge: 'Popular', color: 'text-purple-500', perfIndex: 'Precise',
    benefits: ["Custom Page Ranges", "Instant Local Processing"],
    useCases: ["Extracting Invoices", "Isolating Chapters"],
    instructions: ["Upload PDF", "Set ranges", "Split", "Download"],
    keywords: ["split pdf", "extract pages"],
    faqs: [{ q: "Can I split all pages?", a: "Yes, every page becomes a separate file." }]
  },
  { 
    id: 'compress-pdf-online', 
    name: 'Compress PDF', 
    desc: 'Reduce the size of your PDF files in seconds.', 
    longDesc: 'AJN Studio\'s Compress PDF tool uses advanced downsampling to reduce file size while maintaining readability.',
    icon: Shrink, tag: 'compress', cat: 'pdf', mode: 'PDF', badge: 'Popular', color: 'text-emerald-500', perfIndex: 'Small',
    benefits: ["Extreme Size Reduction", "Fidelity Preservation"],
    useCases: ["Resume for Job Portals", "Government Site Uploads"],
    instructions: ["Upload PDF", "Select level", "Process", "Download"],
    keywords: ["compress pdf", "reduce pdf size"],
    faqs: [{ q: "Will text stay clear?", a: "Yes, our algorithm protects text sharpness." }]
  },
  { id: 'rotate-pdf-online', name: 'Rotate PDF', desc: 'Fix page orientation permanently.', longDesc: 'Fix orientation issues in your PDF documents instantly.', icon: RotateCw, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-orange-500', perfIndex: 'Fast', benefits: ["Visual Rotation", "Batch Support"], useCases: ["Fixing Scanned Docs"], instructions: ["Upload", "Rotate", "Save"], keywords: ["rotate pdf"], faqs: [] },
  { id: 'remove-pdf-pages-online', name: 'Remove Pages', desc: 'Delete unwanted pages from PDF.', longDesc: 'Remove specific pages from your PDF document with ease.', icon: Trash2, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-red-500', perfIndex: 'Precise', benefits: ["Visual Selection"], useCases: ["Removing Blank Pages"], instructions: ["Upload", "Select", "Delete"], keywords: ["delete pdf pages"], faqs: [] },
  { id: 'organize-pdf-online', name: 'Organize PDF', desc: 'Rearrange page order in your PDF.', longDesc: 'Reorder pages in your PDF document visually.', icon: LayoutGrid, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-indigo-500', perfIndex: 'Fast', benefits: ["Drag & Drop Order"], useCases: ["Reordering Reports"], instructions: ["Upload", "Sort", "Save"], keywords: ["reorder pdf"], faqs: [] },
  { id: 'crop-pdf-online', name: 'Crop PDF', desc: 'Trim page margins or select areas.', longDesc: 'Crop PDF pages to remove margins or focus on content.', icon: Crop, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-amber-600', perfIndex: 'Manual', benefits: ["Precision Crop"], useCases: ["Removing White Borders"], instructions: ["Upload", "Crop", "Save"], keywords: ["crop pdf"], faqs: [] },
  { id: 'watermark-pdf-online', name: 'Watermark PDF', desc: 'Add text or image stamps to pages.', longDesc: 'Apply custom watermarks to protect your PDF documents.', icon: Stamp, tag: 'security', cat: 'pdf', mode: 'PDF', color: 'text-slate-600', perfIndex: 'Fast', benefits: ["Brand Protection"], useCases: ["Confidential Labels"], instructions: ["Upload", "Design", "Apply"], keywords: ["watermark pdf"], faqs: [] },
  { id: 'add-page-numbers-online', name: 'Add Numbers', desc: 'Number your PDF pages automatically.', longDesc: 'Add pagination to your PDF files with customizable styles.', icon: FileDigit, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-blue-400', perfIndex: 'Auto', benefits: ["Custom Placement"], useCases: ["Numbering Large Docs"], instructions: ["Upload", "Configure", "Apply"], keywords: ["page numbers pdf"], faqs: [] },
  { id: 'flatten-pdf-online', name: 'Flatten PDF', desc: 'Make forms and layers static.', longDesc: 'Flatten PDF layers to make them permanent and non-editable.', icon: Layers, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-gray-500', perfIndex: 'Secure', benefits: ["Prevents Editing"], useCases: ["Finalizing Signed Docs"], instructions: ["Upload", "Flatten", "Save"], keywords: ["flatten pdf"], faqs: [] },
  { id: 'repair-pdf-online', name: 'Repair PDF', desc: 'Try to fix corrupted PDF files.', longDesc: 'Recover data from broken or corrupted PDF documents.', icon: Wrench, tag: 'utility', cat: 'pdf', mode: 'PDF', color: 'text-red-600', perfIndex: 'Experimental', benefits: ["XREF Recovery"], useCases: ["Broken Downloads"], instructions: ["Upload", "Repair", "Download"], keywords: ["fix pdf"], faqs: [] },
  { id: 'compare-pdf-online', name: 'Compare PDF', desc: 'Audit differences between two PDFs.', longDesc: 'Visually compare two versions of a PDF document.', icon: Binary, tag: 'analysis', cat: 'pdf', mode: 'PDF', color: 'text-blue-900', perfIndex: 'Deep', benefits: ["Visual Diff"], useCases: ["Contract Revisions"], instructions: ["Upload A & B", "Compare", "View"], keywords: ["compare pdfs"], faqs: [] },
  { id: 'add-text-to-pdf-online', name: 'Add Text', desc: 'Type custom text onto PDF pages.', longDesc: 'Annotate your PDF with custom text layers.', icon: Type, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-blue-600', perfIndex: 'Fast', benefits: ["Font Control"], useCases: ["Filling Static Forms"], instructions: ["Upload", "Type", "Save"], keywords: ["add text to pdf"], faqs: [] },
  { id: 'add-image-to-pdf-online', name: 'Add Image', desc: 'Insert photos or logos into PDF.', longDesc: 'Embed images directly into your PDF pages.', icon: LucideImage, tag: 'edit', cat: 'pdf', mode: 'PDF', color: 'text-purple-600', perfIndex: 'Fast', benefits: ["Layer Embedding"], useCases: ["Adding Logos"], instructions: ["Upload PDF", "Add Image", "Save"], keywords: ["insert image in pdf"], faqs: [] },

  // --- CONVERSION TO PDF ---
  { id: 'word-to-pdf-online', name: 'Word to PDF', desc: 'Professional DOCX conversion.', longDesc: 'Convert Microsoft Word documents to high-quality PDF.', icon: FileText, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-blue-600', perfIndex: 'High', benefits: ["Layout Preserved"], useCases: ["DOCX to PDF"], instructions: ["Upload", "Convert", "Save"], keywords: ["word to pdf"], faqs: [] },
  { id: 'excel-to-pdf-online', name: 'Excel to PDF', desc: 'Convert sheets to document tables.', longDesc: 'Transform Excel spreadsheets into PDF reports.', icon: FileSpreadsheet, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-emerald-700', perfIndex: 'High', benefits: ["Table Mapping"], useCases: ["XLSX to PDF"], instructions: ["Upload", "Convert", "Save"], keywords: ["excel to pdf"], faqs: [] },
  { id: 'ppt-to-pdf-online', name: 'PPT to PDF', desc: 'Convert slides to PDF pages.', longDesc: 'Turn PowerPoint presentations into portable PDF files.', icon: Presentation, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-orange-600', perfIndex: 'High', benefits: ["Slide Capture"], useCases: ["PPTX to PDF"], instructions: ["Upload", "Convert", "Save"], keywords: ["ppt to pdf"], faqs: [] },
  { id: 'jpg-to-pdf-online', name: 'JPG to PDF', desc: 'Convert images to a single PDF.', longDesc: 'Combine JPG images into a single PDF document.', icon: ImageIcon, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-amber-500', perfIndex: 'Fast', benefits: ["Batch Conversion"], useCases: ["Photo to PDF"], instructions: ["Upload", "Order", "Save"], keywords: ["jpg to pdf"], faqs: [] },
  { id: 'png-to-pdf-online', name: 'PNG to PDF', desc: 'Preserve alpha in PDF conversion.', longDesc: 'Convert PNG images to PDF while keeping transparency.', icon: ImageIcon, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-blue-400', perfIndex: 'Fast', benefits: ["Alpha Support"], useCases: ["Logo to PDF"], instructions: ["Upload", "Save"], keywords: ["png to pdf"], faqs: [] },
  { id: 'html-to-pdf-online', name: 'HTML to PDF', desc: 'Render web pages to PDF.', longDesc: 'Convert web content or HTML files into PDF documents.', icon: Code2, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-indigo-600', perfIndex: 'Web', benefits: ["DOM Ingestion"], useCases: ["Site to PDF"], instructions: ["Paste URL/HTML", "Save"], keywords: ["html to pdf"], faqs: [] },
  { id: 'zip-to-pdf-online', name: 'ZIP to PDF', desc: 'Convert archive of files to PDF.', longDesc: 'Convert a ZIP archive containing images or docs into a PDF.', icon: FileArchive, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-slate-500', perfIndex: 'Batch', benefits: ["Bulk Processing"], useCases: ["ZIP to PDF"], instructions: ["Upload ZIP", "Convert"], keywords: ["zip to pdf"], faqs: [] },

  // --- CONVERSION FROM PDF ---
  { id: 'pdf-to-word-online', name: 'PDF to Word', desc: 'Reconstruct editable DOCX.', longDesc: 'Convert PDF files back to editable Word documents.', icon: FileEdit, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-blue-500', perfIndex: 'Deep', benefits: ["Reflow Logic"], useCases: ["PDF to DOCX"], instructions: ["Upload", "Process", "Save"], keywords: ["pdf to word"], faqs: [] },
  { id: 'pdf-to-excel-online', name: 'PDF to Excel', desc: 'Extract data to XLSX sheets.', longDesc: 'Extract tabular data from PDF to Excel spreadsheets.', icon: FileSpreadsheet, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-emerald-500', perfIndex: 'Deep', benefits: ["Cell Detection"], useCases: ["PDF to XLSX"], instructions: ["Upload", "Process", "Save"], keywords: ["pdf to excel"], faqs: [] },
  { id: 'pdf-to-ppt-online', name: 'PDF to PPT', desc: 'Transform pages to slides.', longDesc: 'Convert PDF pages into PowerPoint presentation slides.', icon: Presentation, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-orange-500', perfIndex: 'Deep', benefits: ["OOXML Export"], useCases: ["PDF to PPTX"], instructions: ["Upload", "Process", "Save"], keywords: ["pdf to ppt"], faqs: [] },
  { id: 'pdf-to-jpg-online', name: 'PDF to JPG', desc: 'Save every page as a high-res JPG.', longDesc: 'Convert every page of a PDF into an image file.', icon: ImageIcon, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-amber-500', perfIndex: 'High', benefits: ["Grid Export"], useCases: ["PDF to Images"], instructions: ["Upload", "Convert", "Download"], keywords: ["pdf to jpg"], faqs: [] },
  { id: 'pdf-to-zip-online', name: 'PDF to ZIP', desc: 'Package PDF pages into a ZIP.', longDesc: 'Split PDF pages and bundle them into a single ZIP archive.', icon: FileArchive, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-slate-400', perfIndex: 'Batch', benefits: ["Archive Support"], useCases: ["Burst PDF"], instructions: ["Upload", "Process"], keywords: ["pdf to zip"], faqs: [] },
  { id: 'pdf-to-epub-online', name: 'PDF to EPUB', desc: 'Reflow PDF for e-readers.', longDesc: 'Convert PDF documents into reflowable EPUB format.', icon: TabletSmartphone, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-teal-600', perfIndex: 'Flow', benefits: ["Reflowable"], useCases: ["PDF to Kindle"], instructions: ["Upload", "Convert"], keywords: ["pdf to epub"], faqs: [] },

  // --- IMAGE TOOLS ---
  { id: 'online-photo-editor', name: 'Photo Editor', desc: 'Filters, brightness, and contrast.', longDesc: 'Edit your photos with filters and basic adjustments locally.', icon: Sparkles, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-pink-500', perfIndex: 'Studio', benefits: ["Local Filters"], useCases: ["Photo Editing"], instructions: ["Upload", "Adjust", "Save"], keywords: ["photo editor online"], faqs: [] },
  { id: 'remove-background-online', name: 'Remove BG', desc: 'Isolate subjects instantly.', longDesc: 'Remove backgrounds from images with professional precision.', icon: Wand2, tag: 'ai', cat: 'img', mode: 'Image', color: 'text-purple-500', perfIndex: 'Neural', benefits: ["Alpha Cutout"], useCases: ["Logo Cleanup"], instructions: ["Upload", "Process", "Save"], keywords: ["remove bg online"], faqs: [] },
  { id: 'crop-image-online', name: 'Crop Image', desc: 'Trim pixels with precision.', longDesc: 'Crop your images to the perfect dimensions.', icon: Crop, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-amber-600', perfIndex: 'Fast', benefits: ["Manual Rect"], useCases: ["Cropping Photos"], instructions: ["Upload", "Crop", "Save"], keywords: ["crop image"], faqs: [] },
  { id: 'enlarge-image-online', name: 'Upscale AI', desc: 'Increase resolution with AI.', longDesc: 'Upscale low-res images using neural networks.', icon: Maximize, tag: 'ai', cat: 'img', mode: 'Image', color: 'text-indigo-500', perfIndex: 'Neural', benefits: ["High Fidelity"], useCases: ["Small Image Fix"], instructions: ["Upload", "Upscale", "Save"], keywords: ["enlarge image ai"], faqs: [] },
  { id: 'rotate-image-online', name: 'Rotate Image', desc: 'Flip or turn images.', longDesc: 'Rotate images by any angle or flip them.', icon: RotateCw, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-orange-500', perfIndex: 'Fast', benefits: ["Any Angle"], useCases: ["Fix Orientation"], instructions: ["Upload", "Turn", "Save"], keywords: ["rotate image"], faqs: [] },
  { id: 'watermark-image-online', name: 'Watermark Img', desc: 'Protect your photos locally.', longDesc: 'Add watermark stamps to your images.', icon: Stamp, tag: 'security', cat: 'img', mode: 'Image', color: 'text-slate-600', perfIndex: 'Fast', benefits: ["Logo Overlay"], useCases: ["Copyright Marking"], instructions: ["Upload", "Design", "Apply"], keywords: ["watermark image"], faqs: [] },
  { id: 'flip-image-online', name: 'Flip Image', desc: 'Mirror horizontally or vertically.', longDesc: 'Mirror your images for symmetrical effects.', icon: Repeat, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-teal-500', perfIndex: 'Fast', benefits: ["Mirror Effect"], useCases: ["Reflect Photos"], instructions: ["Upload", "Flip", "Save"], keywords: ["flip image"], faqs: [] },
  { id: 'convert-image-online', name: 'Image Convert', desc: 'Transcode between all formats.', longDesc: 'Convert images between JPG, PNG, WEBP, and more.', icon: Repeat, tag: 'convert', cat: 'img', mode: 'Image', color: 'text-blue-500', perfIndex: 'Universal', benefits: ["All Formats"], useCases: ["WEBP to JPG"], instructions: ["Upload", "Target", "Save"], keywords: ["convert image"], faqs: [] },
  { id: 'blur-face-online', name: 'Blur Face', desc: 'Hide identities privately.', longDesc: 'Blur sensitive areas in your photos locally.', icon: Search, tag: 'security', cat: 'img', mode: 'Image', color: 'text-red-500', perfIndex: 'Surgical', benefits: ["Face Privacy"], useCases: ["Privacy Cleanup"], instructions: ["Upload", "Blur", "Save"], keywords: ["blur face online"], faqs: [] },
  { id: 'meme-maker-online', name: 'Meme Maker', desc: 'Add Impact text to photos.', longDesc: 'Create viral memes with custom text overlays.', icon: Smile, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-amber-500', perfIndex: 'Fun', benefits: ["Text Overlay"], useCases: ["Meme Creation"], instructions: ["Upload", "Text", "Save"], keywords: ["meme maker online"], faqs: [] },
  { id: 'reduce-image-size-online', name: 'Reduce Image', desc: 'Shrink image KBs.', longDesc: 'Compress image files for web optimization.', icon: Shrink, tag: 'compress', cat: 'img', mode: 'Image', color: 'text-red-500', perfIndex: 'Light', benefits: ["Web Optimization"], useCases: ["Email Attachments"], instructions: ["Upload", "Slide", "Save"], keywords: ["reduce image size"], faqs: [] },
  { id: 'resize-image-online', name: 'Resize Image', desc: 'Set target pixel dimensions.', longDesc: 'Scale your images to specific dimensions.', icon: Maximize, tag: 'edit', cat: 'img', mode: 'Image', color: 'text-blue-600', perfIndex: 'Precise', benefits: ["Fixed Width/Height"], useCases: ["Standardizing Assets"], instructions: ["Upload", "Size", "Save"], keywords: ["resize image"], faqs: [] },
  { id: 'html-to-image-online', name: 'HTML to Img', desc: 'Capture web nodes as pixels.', longDesc: 'Render HTML code or websites as high-res images.', icon: Code2, tag: 'convert', cat: 'img', mode: 'Image', color: 'text-orange-500', perfIndex: 'Web', benefits: ["DOM Raster"], useCases: ["Web Screenshots"], instructions: ["Paste HTML", "Save"], keywords: ["html to image"], faqs: [] },

  // --- AI & VISION ---
  { id: 'ocr-scanner-online', name: 'OCR Scanner', desc: 'Live camera text recognition.', longDesc: 'Extract text from physical documents using your camera.', icon: Smartphone, tag: 'ai', cat: 'ai', mode: 'AI', color: 'text-teal-500', perfIndex: 'Live', benefits: ["Real-time Scan"], useCases: ["Scanning Invoices"], instructions: ["Camera On", "Capture", "Copy"], keywords: ["ocr scanner"], faqs: [] },
  { id: 'make-pdf-searchable-online', name: 'Searchable PDF', desc: 'Inject neural text layer.', longDesc: 'Run OCR on scanned PDFs to make them searchable.', icon: Search, tag: 'ai', cat: 'ai', mode: 'AI', color: 'text-blue-500', perfIndex: 'Neural', benefits: ["Ctrl+F Support"], useCases: ["Fixing Scanned PDF"], instructions: ["Upload Scan", "Analyze", "Save"], keywords: ["searchable pdf"], faqs: [] },
  { id: 'smart-read-pdf-online', name: 'Smart Read', desc: 'Extract all document text.', longDesc: 'Extract clean text from any PDF document instantly.', icon: BrainCircuit, tag: 'ai', cat: 'ai', mode: 'AI', color: 'text-purple-600', perfIndex: 'Fast', benefits: ["Clean Text"], useCases: ["Copying PDF Content"], instructions: ["Upload", "Read", "Copy"], keywords: ["pdf to text"], faqs: [] },

  // --- UTILITY ---
  { id: 'pdf-metadata-online', name: 'PDF Metadata', desc: 'Scrub or edit file properties.', longDesc: 'View and modify PDF metadata tags locally.', icon: Tag, tag: 'security', cat: 'pdf', mode: 'PDF', color: 'text-slate-500', perfIndex: 'Surgical', benefits: ["Clear Tags"], useCases: ["Renaming PDF Meta"], instructions: ["Upload", "Edit", "Save"], keywords: ["edit pdf metadata"], faqs: [] },
  { id: 'unlock-pdf-online', name: 'Unlock PDF', desc: 'Remove password protection.', longDesc: 'Strip security restrictions from PDF documents.', icon: Unlock, tag: 'security', cat: 'pdf', mode: 'PDF', color: 'text-emerald-600', perfIndex: 'Fast', benefits: ["Key Stripping"], useCases: ["Accessing Locked PDF"], instructions: ["Upload", "Unlock", "Save"], keywords: ["unlock pdf"], faqs: [] },
  { id: 'protect-pdf-online', name: 'Protect PDF', desc: 'Encrypt your documents.', longDesc: 'Add password security to your PDF documents.', icon: Lock, tag: 'security', cat: 'pdf', mode: 'PDF', color: 'text-blue-600', perfIndex: 'Secure', benefits: ["Password Lock"], useCases: ["Securing Statements"], instructions: ["Upload", "Lock", "Save"], keywords: ["protect pdf"], faqs: [] },
  { id: 'zip-extractor-online', name: 'ZIP Extractor', desc: 'Unpack archives locally.', longDesc: 'Extract ZIP archives safely in your browser.', icon: FileArchive, tag: 'utility', cat: 'pdf', mode: 'PDF', color: 'text-slate-400', perfIndex: 'Fast', benefits: ["Local Unzip"], useCases: ["Extracting PDF Bundles"], instructions: ["Upload ZIP", "Extract"], keywords: ["zip extractor"], faqs: [] },
  { id: 'subtitle-generator-online', name: 'Subtitles', desc: 'Generate timed captions.', longDesc: 'Create SRT/VTT subtitle files locally from text.', icon: Captions, tag: 'ai', cat: 'ai', mode: 'AI', color: 'text-indigo-500', perfIndex: 'Timed', benefits: ["Local Sync"], useCases: ["Captions for Video"], instructions: ["Upload", "Generate", "Download"], keywords: ["subtitle generator"], faqs: [] },
  { id: 'psd-to-pdf-online', name: 'PSD to PDF', desc: 'Flatten Photoshop to PDF.', longDesc: 'Convert Adobe Photoshop files to high-quality PDF.', icon: LucideImage, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-blue-900', perfIndex: 'Direct', benefits: ["Layer Flattening"], useCases: ["PSD Preview"], instructions: ["Upload", "Save"], keywords: ["psd to pdf"], faqs: [] },
  { id: 'json-to-pdf-online', name: 'JSON to PDF', desc: 'Render structured data.', longDesc: 'Turn JSON data into clean PDF reports.', icon: FileJson, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-orange-500', perfIndex: 'Schema', benefits: ["Human Readable"], useCases: ["API to PDF"], instructions: ["Upload/Paste", "Render"], keywords: ["json to pdf"], faqs: [] },
  { id: 'txt-to-pdf-online', name: 'TXT to PDF', desc: 'Convert raw notes to document.', longDesc: 'Turn plain text files into professional PDF pages.', icon: FileText, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-slate-600', perfIndex: 'Clean', benefits: ["A4 Vector"], useCases: ["Notes to PDF"], instructions: ["Upload", "Render"], keywords: ["txt to pdf"], faqs: [] },
  { id: 'pdf-to-pdfa-online', name: 'PDF/A Archive', desc: 'Standardize for long-term.', longDesc: 'Convert PDF files to ISO archival standards.', icon: ArchiveRestore, tag: 'utility', cat: 'pdf', mode: 'PDF', color: 'text-blue-800', perfIndex: 'Standard', benefits: ["Archival Grade"], useCases: ["Legal Preservation"], instructions: ["Upload", "Process"], keywords: ["pdf to pdfa"], faqs: [] },
  { id: 'pdf-to-pdfua-online', name: 'Accessible PDF', desc: 'Make compatible for readers.', longDesc: 'Ensure PDF accessibility standards compliance.', icon: Accessibility, tag: 'utility', cat: 'pdf', mode: 'PDF', color: 'text-blue-500', perfIndex: 'Inclusive', benefits: ["Screen Reader"], useCases: ["Gov Compliance"], instructions: ["Upload", "Tag", "Save"], keywords: ["pdf accessibility"], faqs: [] },
  { id: 'xml-to-pdf-online', name: 'XML to PDF', desc: 'Convert schema into report.', longDesc: 'Transform XML data into readable PDF documents.', icon: FileCode, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-emerald-600', perfIndex: 'Schema', benefits: ["Structured Render"], useCases: ["XML to PDF"], instructions: ["Upload", "Render"], keywords: ["xml to pdf"], faqs: [] },
  { id: 'extract-images-from-pdf-online', name: 'Scrape Assets', desc: 'Extract high-res PDF images.', longDesc: 'Extract all embedded images from a PDF document.', icon: ImageIcon, tag: 'extract', cat: 'pdf', mode: 'PDF', color: 'text-pink-600', perfIndex: 'Surgical', benefits: ["Original Quality"], useCases: ["Getting Photos from PDF"], instructions: ["Upload", "Scrape"], keywords: ["extract images pdf"], faqs: [] },
  { id: 'heic-to-pdf-online', name: 'HEIC to PDF', desc: 'Convert iPhone photos.', longDesc: 'Convert Apple HEIC images to portable PDF.', icon: Smartphone, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-cyan-500', perfIndex: 'iOS Native', benefits: ["Direct Transcode"], useCases: ["iPhone to PDF"], instructions: ["Upload", "Save"], keywords: ["heic to pdf"], faqs: [] },
  { id: 'ppt-to-word-online', name: 'PPT to Word', desc: 'Extract slides to DOCX.', longDesc: 'Transform presentations into editable Word text documents.', icon: Presentation, tag: 'convert', cat: 'pdf', mode: 'PDF', color: 'text-orange-500', perfIndex: 'High', benefits: ["Text Reconstruction"], useCases: ["Slides to Text"], instructions: ["Upload", "Process", "Save"], keywords: ["ppt to word"], faqs: [] }
];
