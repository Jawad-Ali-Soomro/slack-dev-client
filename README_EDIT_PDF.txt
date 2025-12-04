# edit-pdf

A powerful and flexible React PDF editor component with comprehensive annotation tools.

## Installation

```bash
npm install edit-pdf
```

## Usage

### Basic Usage

```tsx
import { PdfEditor } from 'edit-pdf';
import { useState } from 'react';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <PdfEditor fileUrl="/path/to/document.pdf" />
    </div>
  );
}

export default App;
```

### Advanced Usage with Export Control

```tsx
import { PdfEditor } from 'edit-pdf';
import { useState } from 'react';

function App() {
  const [shouldExport, setShouldExport] = useState(false);

  const handleSave = (file: File) => {
    console.log("Saved file:", file);
    // Download the file
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "edited.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // You can also upload to server, process the file, etc.
  };

  const handleSaveClick = () => {
    setShouldExport(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <button onClick={handleSaveClick}>Save PDF</button>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PdfEditor 
          fileUrl="/path/to/document.pdf" 
          onSave={handleSave}
          shouldExport={shouldExport}
          onExportComplete={() => setShouldExport(false)}
        />
      </div>
    </div>
  );
}

export default App;
```

## Features

- **View PDF**: Render PDF documents with high fidelity.
- **Annotations**:
  - **Highlight**: Highlight text with customizable colors and stroke width.
  - **Pen**: Freehand drawing tool with customizable colors and stroke width.
  - **Text**: Insert text annotations with customizable colors.
  - **Shapes**: Add rectangles, circles, ellipses, arrows, and lines with customizable stroke colors, widths, and rotation.
  - **Images**: Insert images into the PDF.
- **Signatures**: Create, save, and manage signatures with drawing canvas.
- **Eraser**: Remove annotations with adjustable eraser width.
- **Search**: Find and navigate text within the document.
- **Export**: Export annotated PDFs with all annotations embedded.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fileUrl` | `string` | Yes | The URL of the PDF file to load. |
| `onSave` | `(file: File) => void` | No | Callback function called when PDF is exported. Receives the edited PDF file. |
| `shouldExport` | `boolean` | No | Boolean flag to trigger PDF export. Set to `true` to export the PDF. |
| `onExportComplete` | `() => void` | No | Callback function called after export is complete. Use this to reset `shouldExport` to `false`. |

## Export Workflow

The component uses a boolean trigger pattern for exporting:

1. Set `shouldExport` to `true` to trigger export
2. The component will generate the PDF and call `onSave` with the file
3. Call `onExportComplete` to reset the flag (typically set `shouldExport` back to `false`)

This pattern gives you full control over when and how the PDF is exported, allowing you to:
- Download the file
- Upload to a server
- Process the file before saving
- Show loading states
- Handle errors

## License

MIT