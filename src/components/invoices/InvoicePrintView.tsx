import { useLanguage } from '@/contexts/LanguageContext';

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface Invoice {
  invoice_number: string;
  type: string;
  reference_number: string;
  customer_supplier_name: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  items: InvoiceItem[];
}

interface InvoicePrintViewProps {
  invoice: Invoice;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

export function InvoicePrintView({ 
  invoice, 
  companyName = 'PT. Nama Perusahaan',
  companyAddress = 'Jl. Contoh No. 123, Jakarta 12345',
  companyPhone = '021-12345678'
}: InvoicePrintViewProps) {
  const { formatCurrency, formatDate, language } = useLanguage();

  const remaining = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="bg-white p-8 print:p-0 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-foreground pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">{companyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{companyAddress}</p>
          <p className="text-sm text-muted-foreground">Telp: {companyPhone}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg uppercase">
            {invoice.type === 'sales' 
              ? (language === 'id' ? 'FAKTUR PENJUALAN' : 'SALES INVOICE')
              : (language === 'id' ? 'FAKTUR PEMBELIAN' : 'PURCHASE INVOICE')}
          </p>
          <p className="text-lg font-semibold text-primary mt-1">{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Invoice Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {invoice.type === 'sales' 
              ? (language === 'id' ? 'Ditagihkan Kepada' : 'Bill To')
              : (language === 'id' ? 'Diterima Dari' : 'Received From')}
          </p>
          <p className="font-semibold text-lg">{invoice.customer_supplier_name}</p>
        </div>
        <div className="text-right space-y-1">
          <div className="flex justify-end gap-4">
            <span className="text-muted-foreground">{language === 'id' ? 'Tanggal' : 'Date'}:</span>
            <span className="font-medium w-28">{formatDate(invoice.invoice_date)}</span>
          </div>
          <div className="flex justify-end gap-4">
            <span className="text-muted-foreground">{language === 'id' ? 'Jatuh Tempo' : 'Due Date'}:</span>
            <span className="font-medium w-28">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="flex justify-end gap-4">
            <span className="text-muted-foreground">{language === 'id' ? 'Referensi' : 'Reference'}:</span>
            <span className="font-medium w-28">{invoice.reference_number}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-y-2 border-foreground">
              <th className="text-left py-3 font-semibold">{language === 'id' ? 'Deskripsi' : 'Description'}</th>
              <th className="text-center py-3 font-semibold w-20">{language === 'id' ? 'Qty' : 'Qty'}</th>
              <th className="text-right py-3 font-semibold w-32">{language === 'id' ? 'Harga Satuan' : 'Unit Price'}</th>
              <th className="text-right py-3 font-semibold w-36">{language === 'id' ? 'Jumlah' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-muted">
                <td className="py-3">{item.name}</td>
                <td className="py-3 text-center">{item.qty}</td>
                <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72 space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{language === 'id' ? 'Subtotal' : 'Subtotal'}:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between py-1 text-success">
              <span>{language === 'id' ? 'Diskon' : 'Discount'}:</span>
              <span>-{formatCurrency(invoice.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">PPN (11%):</span>
            <span>{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-foreground font-bold text-lg">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">{language === 'id' ? 'Dibayar' : 'Paid'}:</span>
            <span className="text-success">{formatCurrency(invoice.paid_amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-foreground font-bold">
            <span>{language === 'id' ? 'Sisa Pembayaran' : 'Balance Due'}:</span>
            <span className={remaining > 0 ? 'text-destructive' : 'text-success'}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-muted pt-6 mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-muted-foreground mb-2">{language === 'id' ? 'Catatan' : 'Notes'}:</p>
            <p className="text-sm">{language === 'id' ? 'Terima kasih atas kepercayaan Anda' : 'Thank you for your business'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {language === 'id' ? 'Dicetak pada' : 'Printed on'}: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles - A4 */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
