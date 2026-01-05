-- Create expense categories table
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expense_categories
CREATE POLICY "Authenticated users can read expense_categories" 
ON public.expense_categories FOR SELECT USING (true);

CREATE POLICY "Staff can insert expense_categories" 
ON public.expense_categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update expense_categories" 
ON public.expense_categories FOR UPDATE USING (true);

CREATE POLICY "Owners can delete expense_categories" 
ON public.expense_categories FOR DELETE 
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_number TEXT NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  category_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'approved',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "Authenticated users can read expenses" 
ON public.expenses FOR SELECT USING (true);

CREATE POLICY "Staff can insert expenses" 
ON public.expenses FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update expenses" 
ON public.expenses FOR UPDATE USING (true);

CREATE POLICY "Owners can delete expenses" 
ON public.expenses FOR DELETE 
USING (has_role(auth.uid(), 'owner'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.expense_categories (name, description, is_default) VALUES
('Gaji & Upah', 'Pembayaran gaji karyawan dan upah tenaga kerja', true),
('Sewa', 'Biaya sewa tempat usaha, gudang, dll', true),
('Listrik & Air', 'Tagihan listrik, air, dan utilitas lainnya', true),
('Internet & Telepon', 'Biaya langganan internet dan telepon', true),
('Transportasi', 'Biaya transport, bensin, parkir, dll', true),
('Marketing & Promosi', 'Biaya iklan, promosi, dan pemasaran', true),
('Maintenance', 'Biaya perawatan peralatan dan gedung', true),
('Supplies', 'Perlengkapan kantor dan operasional', true),
('Lainnya', 'Pengeluaran lain-lain', true);