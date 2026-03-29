/**
 * Velox Supreme v4 — Export Utilities
 * Provides branded PDF (via browser print) and CSV export.
 * Zero external dependencies — works out of the box.
 */

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportToCSV(filename: string, headers: string[], rows: unknown[][]): void {
  // Generate a proper Excel XML (SpreadsheetML) file — no library needed, Excel opens it natively
  const escapeXml = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const headerRow = headers
    .map(h => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join('');

  const dataRows = rows.map(row =>
    `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="10"/>
      <Interior ss:Color="#3b82f6" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Velox Export">
    <Table>
      <Row>${headerRow}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


// ─── PDF Export (Browser Print Window) ───────────────────────────────────────

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: unknown[][];
  filename: string;
  accentHex?: string;
}

export async function exportToPDF({
  title,
  subtitle,
  headers,
  rows,
  accentHex = '#3b82f6',
}: PDFExportOptions): Promise<void> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const tableRows = rows
    .map((row, i) => `
      <tr style="background:${i % 2 === 0 ? '#0f0f0f' : '#0a0a0a'}">
        ${row.map(cell => `<td>${cell ?? '—'}</td>`).join('')}
      </tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title} — Velox Supreme</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#000; color:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; }

    .header { background:#050505; padding:28px 36px 24px; border-bottom:2px solid ${accentHex}; display:flex; justify-content:space-between; align-items:center; }
    .brand-name { font-size:28px; font-weight:900; color:#fff; letter-spacing:-1px; font-style:italic; }
    .brand-dot { display:inline-block; width:8px; height:8px; background:${accentHex}; border-radius:50%; margin-left:3px; margin-bottom:3px; }
    .brand-tag { font-size:9px; font-weight:700; color:${accentHex}; letter-spacing:0.35em; text-transform:uppercase; display:block; margin-top:4px; }
    .report-title { font-size:18px; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:-0.5px; font-style:italic; text-align:right; }
    .report-sub { font-size:10px; color:#6b7280; margin-top:4px; font-weight:500; text-align:right; }

    .meta { background:#0a0a0a; padding:14px 36px; display:flex; justify-content:space-between; border-bottom:1px solid #1a1a1a; }
    .meta span { font-size:10px; color:#6b7280; font-weight:600; }
    .meta strong { color:${accentHex}; }

    .content { padding:28px 36px 80px; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:${accentHex} !important; }
    thead th { padding:11px 14px; text-align:left; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.08em; color:#fff; white-space:nowrap; }
    tbody td { padding:9px 14px; color:#d1d5db; font-size:11px; border-bottom:1px solid #1f1f1f; white-space:nowrap; }

    .footer { background:#050505; padding:14px 36px; display:flex; justify-content:space-between; border-top:1px solid #1a1a1a; position:fixed; bottom:0; left:0; right:0; }
    .footer span { font-size:9px; color:#374151; font-weight:600; }
    .empty { text-align:center; padding:60px 20px; color:#4b5563; font-size:13px; }

    @media print {
      @page { margin:0; size:A4 landscape; }
      body { background:#000 !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <span class="brand-name">VELOX<span class="brand-dot"></span></span>
      <span class="brand-tag">Supreme Logistics Platform v4</span>
    </div>
    <div>
      <div class="report-title">${title}</div>
      ${subtitle ? `<div class="report-sub">${subtitle}</div>` : ''}
    </div>
  </div>
  <div class="meta">
    <span>Generado: <strong>${dateStr} a las ${timeStr}</strong></span>
    <span>Total de registros: <strong>${rows.length}</strong></span>
  </div>
  <div class="content">
    ${rows.length === 0
      ? '<div class="empty">Sin registros para exportar.</div>'
      : `<table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>`
    }
  </div>
  <div class="footer">
    <span>Velox Technologies · Confidencial · Uso Interno</span>
    <span>${dateStr}</span>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1200,height=800');
  if (!win) throw new Error('Permite pop-ups para este sitio para generar el PDF.');
  win.document.write(html);
  win.document.close();
}

// ─── Module-Specific Helpers ──────────────────────────────────────────────────

export const exportInvoices = {
  csv: (invoices: any[]) => exportToCSV(
    'velox_facturas',
    ['N° Factura', 'Cliente', 'Estado', 'Total (COP)', 'Vencimiento', 'Fecha Creación'],
    invoices.map(i => [
      i.invoiceNumber, i.clientName, i.status,
      `$${(i.total ?? 0).toLocaleString('es-CO')}`,
      i.dueDate?.toDate ? i.dueDate.toDate().toLocaleDateString('es-CO') : i.dueDate ?? '',
      i.createdAt?.toDate ? i.createdAt.toDate().toLocaleDateString('es-CO') : i.createdAt ?? '',
    ])
  ),
  pdf: (invoices: any[]) => exportToPDF({
    title: 'Control de Facturación',
    subtitle: 'Reporte Financiero · Velox Supreme v4',
    filename: 'velox_facturas',
    accentHex: '#3b82f6',
    headers: ['N° Factura', 'Cliente', 'Estado', 'Total (COP)', 'Vencimiento', 'Fecha Creación'],
    rows: invoices.map(i => [
      i.invoiceNumber, i.clientName, i.status,
      `$${(i.total ?? 0).toLocaleString('es-CO')}`,
      i.dueDate?.toDate ? i.dueDate.toDate().toLocaleDateString('es-CO') : i.dueDate ?? '',
      i.createdAt?.toDate ? i.createdAt.toDate().toLocaleDateString('es-CO') : i.createdAt ?? '',
    ]),
  }),
};

export const exportOrders = {
  csv: (orders: any[]) => exportToCSV(
    'velox_pedidos',
    ['ID', 'Cliente', 'Ciudad', 'Estado', 'Monto (COP)', 'Servicio', 'Prioridad', 'Fecha'],
    orders.map(o => [
      o.id?.substring(0, 8) ?? '', o.client, o.city, o.status,
      `$${(o.amount ?? 0).toLocaleString('es-CO')}`,
      o.serviceType ?? 'Estándar', o.priority ?? 'Media',
      o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('es-CO') : '',
    ])
  ),
  pdf: (orders: any[]) => exportToPDF({
    title: 'Registro de Pedidos',
    subtitle: 'Inventario Operativo · Velox Supreme v4',
    filename: 'velox_pedidos',
    accentHex: '#3b82f6',
    headers: ['ID', 'Cliente', 'Ciudad', 'Estado', 'Monto (COP)', 'Servicio', 'Prioridad', 'Fecha'],
    rows: orders.map(o => [
      o.id?.substring(0, 8) ?? '', o.client, o.city, o.status,
      `$${(o.amount ?? 0).toLocaleString('es-CO')}`,
      o.serviceType ?? 'Estándar', o.priority ?? 'Media',
      o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('es-CO') : '',
    ]),
  }),
};

export const exportCustomers = {
  csv: (customers: any[]) => exportToCSV(
    'velox_clientes',
    ['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Tipo', 'Estado', 'Pedidos'],
    customers.map(c => [c.name, c.email, c.phone, c.city, c.type ?? 'Persona Natural', c.status ?? 'Activo', c.ordersCount ?? 0])
  ),
  pdf: (customers: any[]) => exportToPDF({
    title: 'Directorio de Clientes',
    subtitle: 'Base de Datos Corporativa · Velox Supreme v4',
    filename: 'velox_clientes',
    accentHex: '#10b981',
    headers: ['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Tipo', 'Estado', 'Pedidos'],
    rows: customers.map(c => [c.name, c.email, c.phone, c.city, c.type ?? 'Persona Natural', c.status ?? 'Activo', c.ordersCount ?? 0]),
  }),
};

export const exportDrivers = {
  csv: (drivers: any[]) => exportToCSV(
    'velox_repartidores',
    ['Nombre', 'Teléfono', 'Ciudad', 'Vehículo', 'Estado', 'Calificación', 'Entregas'],
    drivers.map(d => [d.name, d.phone, d.city, d.vehicle, d.status, d.rating ?? '—', d.deliveries ?? 0])
  ),
  pdf: (drivers: any[]) => exportToPDF({
    title: 'Flota de Repartidores',
    subtitle: 'Gestión Operativa · Velox Supreme v4',
    filename: 'velox_repartidores',
    accentHex: '#f59e0b',
    headers: ['Nombre', 'Teléfono', 'Ciudad', 'Vehículo', 'Estado', 'Calificación', 'Entregas'],
    rows: drivers.map(d => [d.name, d.phone, d.city, d.vehicle, d.status, d.rating ?? '—', d.deliveries ?? 0]),
  }),
};
