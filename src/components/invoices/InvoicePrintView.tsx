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
    <div className="bg-white p-6 print:p-0 font-mono text-sm" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-foreground pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wide">{companyName}</h1>
        <p className="text-xs mt-1">{companyAddress}</p>
        <p className="text-xs">Telp: {companyPhone}</p>
      </div>

      {/* Invoice Info */}
      <div className="border-b border-dashed border-foreground pb-3 mb-3">
        <div className="text-center mb-2">
          <p className="font-bold text-base uppercase">
            {invoice.type === 'sales' 
              ? (language === 'id' ? 'FAKTUR PENJUALAN' : 'SALES INVOICE')
              : (language === 'id' ? 'FAKTUR PEMBELIAN' : 'PURCHASE INVOICE')}
          </p>
          <p className="text-xs">{invoice.invoice_number}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-2 text-xs">
          <p>{language === 'id' ? 'Tanggal' : 'Date'}:</p>
          <p className="text-right">{formatDate(invoice.invoice_date)}</p>
          <p>{language === 'id' ? 'Jatuh Tempo' : 'Due Date'}:</p>
          <p className="text-right">{formatDate(invoice.due_date)}</p>
          <p>{language === 'id' ? 'Referensi' : 'Reference'}:</p>
          <p className="text-right">{invoice.reference_number}</p>
        </div>
      </div>

      {/* Customer/Supplier */}
      <div className="border-b border-dashed border-foreground pb-3 mb-3">
        <p className="text-xs text-muted-foreground">
          {invoice.type === 'sales' 
            ? (language === 'id' ? 'Pelanggan:' : 'Customer:')
            : (language === 'id' ? 'Pemasok:' : 'Supplier:')}
        </p>
        <p className="font-semibold">{invoice.customer_supplier_name}</p>
      </div>

      {/* Items */}
      <div className="border-b border-dashed border-foreground pb-3 mb-3">
        <div className="text-xs">
          <div className="flex justify-between font-bold border-b border-foreground pb-1 mb-2">
            <span className="flex-1">{language === 'id' ? 'ITEM' : 'ITEM'}</span>
            <span className="w-16 text-center">{language === 'id' ? 'QTY' : 'QTY'}</span>
            <span className="w-24 text-right">{language === 'id' ? 'HARGA' : 'PRICE'}</span>
            <span className="w-28 text-right">{language === 'id' ? 'TOTAL' : 'TOTAL'}</span>
          </div>
          {invoice.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-0.5">
              <span className="flex-1 truncate pr-2">{item.name}</span>
              <span className="w-16 text-center">{item.qty}</span>
              <span className="w-24 text-right">{formatCurrency(item.price)}</span>
              <span className="w-28 text-right">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-b-2 border-dashed border-foreground pb-3 mb-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>{language === 'id' ? 'Subtotal' : 'Subtotal'}:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between text-success">
              <span>{language === 'id' ? 'Diskon' : 'Discount'}:</span>
              <span>-{formatCurrency(invoice.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>PPN (11%):</span>
            <span>{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-foreground pt-1 mt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="border-b border-dashed border-foreground pb-3 mb-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>{language === 'id' ? 'Dibayar' : 'Paid'}:</span>
            <span className="text-success">{formatCurrency(invoice.paid_amount)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>{language === 'id' ? 'Sisa' : 'Remaining'}:</span>
            <span className={remaining > 0 ? 'text-destructive' : 'text-success'}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        <p>{language === 'id' ? 'Terima kasih atas kepercayaan Anda' : 'Thank you for your business'}</p>
        <p className="mt-2">================================</p>
        <p className="text-[10px] mt-1">
          {language === 'id' ? 'Dicetak pada' : 'Printed on'}: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:p-0 {
            padding: 8mm !important;
          }
        }
      `}</style>
    </div>
  );
}
