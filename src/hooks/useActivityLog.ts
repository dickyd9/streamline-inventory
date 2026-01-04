import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export type ActivityAction = 
  | 'create' | 'update' | 'delete' 
  | 'approve' | 'reject' | 'cancel'
  | 'stock_in' | 'stock_out' | 'adjustment'
  | 'payment' | 'login' | 'logout';

export type EntityType = 
  | 'product' | 'category' | 'supplier' | 'customer'
  | 'purchase_order' | 'sales_order' | 'invoice' | 'payment'
  | 'stock_movement' | 'stocktake' | 'user';

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
}

export function useActivityLog() {
  const { user, role } = useAuth();

  const logActivity = useCallback(async ({
    action,
    entityType,
    entityId,
    entityName,
    details,
  }: LogActivityParams) => {
    if (!user) return;

    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        user_name: profile?.full_name || user.email,
        user_role: role,
        action,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        details,
      });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, [user, role]);

  return { logActivity };
}
