export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dealerships: {
        Row: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          city: string | null;
          state: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          dealership_id: string | null;
          full_name: string | null;
          role: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          dealership_id?: string | null;
          full_name?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          dealership_id?: string | null;
          full_name?: string | null;
          role?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicles: {
        Row: {
          id: string;
          dealership_id: string;
          brand: string;
          model: string;
          variant: string | null;
          manufacturing_year: number;
          registration_year: number;
          registration_number: string | null;
          vin: string | null;
          fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
          transmission: "manual" | "automatic" | "dual_clutch" | "pdk";
          body_type: "coupe" | "sedan" | "suv" | "hatchback" | "convertible" | "wagon";
          kilometers: number;
          ownership_count: number;
          exterior_color: string | null;
          interior_color: string | null;
          asking_price: number;
          featured: boolean;
          certified: boolean;
          description: string | null;
          purchase_price: number | null;
          refurbishment_cost: number | null;
          minimum_floor_price: number | null;
          acquisition_date: string | null;
          acquired_from: string | null;
          internal_notes: string | null;
          status: "draft" | "in_refurbishment" | "available" | "reserved" | "sold" | "archived";
          published_at: string | null;
          sold_at: string | null;
          sold_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          brand: string;
          model: string;
          variant?: string | null;
          manufacturing_year: number;
          registration_year: number;
          registration_number?: string | null;
          vin?: string | null;
          fuel_type?: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
          transmission?: "manual" | "automatic" | "dual_clutch" | "pdk";
          body_type?: "coupe" | "sedan" | "suv" | "hatchback" | "convertible" | "wagon";
          kilometers?: number;
          ownership_count?: number;
          exterior_color?: string | null;
          interior_color?: string | null;
          asking_price: number;
          featured?: boolean;
          certified?: boolean;
          description?: string | null;
          purchase_price?: number | null;
          refurbishment_cost?: number | null;
          minimum_floor_price?: number | null;
          acquisition_date?: string | null;
          acquired_from?: string | null;
          internal_notes?: string | null;
          status?: "draft" | "in_refurbishment" | "available" | "reserved" | "sold" | "archived";
          published_at?: string | null;
          sold_at?: string | null;
          sold_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          brand?: string;
          model?: string;
          variant?: string | null;
          manufacturing_year?: number;
          registration_year?: number;
          registration_number?: string | null;
          vin?: string | null;
          fuel_type?: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
          transmission?: "manual" | "automatic" | "dual_clutch" | "pdk";
          body_type?: "coupe" | "sedan" | "suv" | "hatchback" | "convertible" | "wagon";
          kilometers?: number;
          ownership_count?: number;
          exterior_color?: string | null;
          interior_color?: string | null;
          asking_price?: number;
          featured?: boolean;
          certified?: boolean;
          description?: string | null;
          purchase_price?: number | null;
          refurbishment_cost?: number | null;
          minimum_floor_price?: number | null;
          acquisition_date?: string | null;
          acquired_from?: string | null;
          internal_notes?: string | null;
          status?: "draft" | "in_refurbishment" | "available" | "reserved" | "sold" | "archived";
          published_at?: string | null;
          sold_at?: string | null;
          sold_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_media: {
        Row: {
          id: string;
          dealership_id: string;
          vehicle_id: string;
          url: string;
          is_hero: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vehicle_id: string;
          url: string;
          is_hero?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vehicle_id?: string;
          url?: string;
          is_hero?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicle_media_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_media_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          dealership_id: string;
          customer_name: string;
          phone_number: string;
          email: string | null;
          city: string | null;
          vehicle_id: string | null;
          source: "website_form" | "whatsapp_direct" | "showroom_walkin" | "phone_call" | "referral" | "other";
          status: "new" | "contacted" | "interested" | "test_drive_scheduled" | "negotiation" | "booked" | "converted" | "lost";
          priority: "low" | "medium" | "high" | "urgent";
          budget_amount: number | null;
          financing_required: boolean;
          trade_in_vehicle: string | null;
          assigned_to: string | null;
          next_followup_at: string | null;
          lost_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          customer_name: string;
          phone_number: string;
          email?: string | null;
          city?: string | null;
          vehicle_id?: string | null;
          source?: "website_form" | "whatsapp_direct" | "showroom_walkin" | "phone_call" | "referral" | "other";
          status?: "new" | "contacted" | "interested" | "test_drive_scheduled" | "negotiation" | "booked" | "converted" | "lost";
          priority?: "low" | "medium" | "high" | "urgent";
          budget_amount?: number | null;
          financing_required?: boolean;
          trade_in_vehicle?: string | null;
          assigned_to?: string | null;
          next_followup_at?: string | null;
          lost_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          customer_name?: string;
          phone_number?: string;
          email?: string | null;
          city?: string | null;
          vehicle_id?: string | null;
          source?: "website_form" | "whatsapp_direct" | "showroom_walkin" | "phone_call" | "referral" | "other";
          status?: "new" | "contacted" | "interested" | "test_drive_scheduled" | "negotiation" | "booked" | "converted" | "lost";
          priority?: "low" | "medium" | "high" | "urgent";
          budget_amount?: number | null;
          financing_required?: boolean;
          trade_in_vehicle?: string | null;
          assigned_to?: string | null;
          next_followup_at?: string | null;
          lost_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_activities: {
        Row: {
          id: string;
          dealership_id: string;
          lead_id: string;
          created_by: string | null;
          activity_type: "status_change" | "note_added" | "call_logged" | "whatsapp_sent" | "test_drive_booked" | "assignment_change";
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          lead_id: string;
          created_by?: string | null;
          activity_type?: "status_change" | "note_added" | "call_logged" | "whatsapp_sent" | "test_drive_booked" | "assignment_change";
          title: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          lead_id?: string;
          created_by?: string | null;
          activity_type?: "status_change" | "note_added" | "call_logged" | "whatsapp_sent" | "test_drive_booked" | "assignment_change";
          title?: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_activities_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      test_drives: {
        Row: {
          id: string;
          dealership_id: string;
          vehicle_id: string;
          lead_id: string | null;
          assigned_to: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          driving_license_number: string | null;
          driving_license_url: string | null;
          status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          scheduled_at: string;
          duration_minutes: number;
          started_at: string | null;
          start_odometer_km: number | null;
          start_fuel_level: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          pre_drive_notes: string | null;
          completed_at: string | null;
          end_odometer_km: number | null;
          end_fuel_level: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          post_drive_notes: string | null;
          customer_rating: number | null;
          customer_feedback: string | null;
          interest_tier: "hot" | "warm" | "cold" | null;
          next_step_action: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vehicle_id: string;
          lead_id?: string | null;
          assigned_to?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          driving_license_number?: string | null;
          driving_license_url?: string | null;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          scheduled_at: string;
          duration_minutes?: number;
          started_at?: string | null;
          start_odometer_km?: number | null;
          start_fuel_level?: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          pre_drive_notes?: string | null;
          completed_at?: string | null;
          end_odometer_km?: number | null;
          end_fuel_level?: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          post_drive_notes?: string | null;
          customer_rating?: number | null;
          customer_feedback?: string | null;
          interest_tier?: "hot" | "warm" | "cold" | null;
          next_step_action?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vehicle_id?: string;
          lead_id?: string | null;
          assigned_to?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          driving_license_number?: string | null;
          driving_license_url?: string | null;
          status?: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
          scheduled_at?: string;
          duration_minutes?: number;
          started_at?: string | null;
          start_odometer_km?: number | null;
          start_fuel_level?: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          pre_drive_notes?: string | null;
          completed_at?: string | null;
          end_odometer_km?: number | null;
          end_fuel_level?: "reserve" | "quarter" | "half" | "three_quarters" | "full" | null;
          post_drive_notes?: string | null;
          customer_rating?: number | null;
          customer_feedback?: string | null;
          interest_tier?: "hot" | "warm" | "cold" | null;
          next_step_action?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "test_drives_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "test_drives_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "test_drives_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "test_drives_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vehicle_expenses: {
        Row: {
          id: string;
          dealership_id: string;
          vehicle_id: string;
          category: ReconditioningCategory;
          description: string;
          vendor_name: string | null;
          invoice_number: string | null;
          invoice_date: string | null;
          amount: number;
          paid_by_dealership: boolean;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vehicle_id: string;
          category?: ReconditioningCategory;
          description: string;
          vendor_name?: string | null;
          invoice_number?: string | null;
          invoice_date?: string | null;
          amount: number;
          paid_by_dealership?: boolean;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vehicle_id?: string;
          category?: ReconditioningCategory;
          description?: string;
          vendor_name?: string | null;
          invoice_number?: string | null;
          invoice_date?: string | null;
          amount?: number;
          paid_by_dealership?: boolean;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicle_expenses_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vehicle_expenses_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_deals: {
        Row: {
          id: string;
          dealership_id: string;
          deal_number: string;
          vehicle_id: string;
          lead_id: string | null;
          sales_rep_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          customer_address: string | null;
          customer_pan: string | null;
          customer_aadhaar: string | null;
          agreed_selling_price: number;
          rto_transfer_charges: number;
          insurance_charges: number;
          extended_warranty_fee: number;
          accessories_charges: number;
          discount_amount: number;
          total_deal_amount: number;
          token_amount: number;
          token_paid_at: string | null;
          token_receipt_number: string | null;
          is_token_refundable: boolean;
          is_financed: boolean;
          financier_name: string | null;
          loan_application_ref: string | null;
          loan_sanctioned_amount: number;
          loan_disbursed_amount: number;
          delivery_order_number: string | null;
          delivery_order_url: string | null;
          has_exchange: boolean;
          exchange_vehicle_id: string | null;
          exchange_allowance: number;
          vehicle_purchase_cost: number;
          vehicle_landed_cost: number;
          taxable_margin: number;
          gst_rate_percent: number;
          cgst_amount: number;
          sgst_amount: number;
          total_gst_on_margin: number;
          net_gross_profit: number;
          sales_commission_amount: number;
          status: DealStatus;
          rto_status: RtoTransferStatus;
          rto_application_no: string | null;
          rto_completion_date: string | null;
          new_rc_smartcard_url: string | null;
          gate_pass_number: string | null;
          delivered_at: string | null;
          delivery_odometer_km: number | null;
          delivery_fuel_level: string | null;
          handover_photo_url: string | null;
          delivery_notes: string | null;
          cancellation_reason: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          deal_number: string;
          vehicle_id: string;
          lead_id?: string | null;
          sales_rep_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          customer_address?: string | null;
          customer_pan?: string | null;
          customer_aadhaar?: string | null;
          agreed_selling_price: number;
          rto_transfer_charges?: number;
          insurance_charges?: number;
          extended_warranty_fee?: number;
          accessories_charges?: number;
          discount_amount?: number;
          total_deal_amount: number;
          token_amount?: number;
          token_paid_at?: string | null;
          token_receipt_number?: string | null;
          is_token_refundable?: boolean;
          is_financed?: boolean;
          financier_name?: string | null;
          loan_application_ref?: string | null;
          loan_sanctioned_amount?: number;
          loan_disbursed_amount?: number;
          delivery_order_number?: string | null;
          delivery_order_url?: string | null;
          has_exchange?: boolean;
          exchange_vehicle_id?: string | null;
          exchange_allowance?: number;
          vehicle_purchase_cost: number;
          vehicle_landed_cost: number;
          taxable_margin?: number;
          gst_rate_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          total_gst_on_margin?: number;
          net_gross_profit?: number;
          sales_commission_amount?: number;
          status?: DealStatus;
          rto_status?: RtoTransferStatus;
          rto_application_no?: string | null;
          rto_completion_date?: string | null;
          new_rc_smartcard_url?: string | null;
          gate_pass_number?: string | null;
          delivered_at?: string | null;
          delivery_odometer_km?: number | null;
          delivery_fuel_level?: string | null;
          handover_photo_url?: string | null;
          delivery_notes?: string | null;
          cancellation_reason?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          deal_number?: string;
          vehicle_id?: string;
          lead_id?: string | null;
          sales_rep_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          customer_address?: string | null;
          customer_pan?: string | null;
          customer_aadhaar?: string | null;
          agreed_selling_price?: number;
          rto_transfer_charges?: number;
          insurance_charges?: number;
          extended_warranty_fee?: number;
          accessories_charges?: number;
          discount_amount?: number;
          total_deal_amount?: number;
          token_amount?: number;
          token_paid_at?: string | null;
          token_receipt_number?: string | null;
          is_token_refundable?: boolean;
          is_financed?: boolean;
          financier_name?: string | null;
          loan_application_ref?: string | null;
          loan_sanctioned_amount?: number;
          loan_disbursed_amount?: number;
          delivery_order_number?: string | null;
          delivery_order_url?: string | null;
          has_exchange?: boolean;
          exchange_vehicle_id?: string | null;
          exchange_allowance?: number;
          vehicle_purchase_cost?: number;
          vehicle_landed_cost?: number;
          taxable_margin?: number;
          gst_rate_percent?: number;
          cgst_amount?: number;
          sgst_amount?: number;
          total_gst_on_margin?: number;
          net_gross_profit?: number;
          sales_commission_amount?: number;
          status?: DealStatus;
          rto_status?: RtoTransferStatus;
          rto_application_no?: string | null;
          rto_completion_date?: string | null;
          new_rc_smartcard_url?: string | null;
          gate_pass_number?: string | null;
          delivered_at?: string | null;
          delivery_odometer_km?: number | null;
          delivery_fuel_level?: string | null;
          handover_photo_url?: string | null;
          delivery_notes?: string | null;
          cancellation_reason?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_deals_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_deals_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_deals_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_deals_sales_rep_id_fkey";
            columns: ["sales_rep_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_payments: {
        Row: {
          id: string;
          dealership_id: string;
          deal_id: string;
          payment_number: string;
          payment_type: PaymentType;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          amount: number;
          transaction_ref: string | null;
          cheque_bank_name: string | null;
          cheque_date: string | null;
          cleared_at: string | null;
          received_by: string | null;
          receipt_pdf_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          deal_id: string;
          payment_number: string;
          payment_type?: PaymentType;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          amount: number;
          transaction_ref?: string | null;
          cheque_bank_name?: string | null;
          cheque_date?: string | null;
          cleared_at?: string | null;
          received_by?: string | null;
          receipt_pdf_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          deal_id?: string;
          payment_number?: string;
          payment_type?: PaymentType;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          amount?: number;
          transaction_ref?: string | null;
          cheque_bank_name?: string | null;
          cheque_date?: string | null;
          cleared_at?: string | null;
          received_by?: string | null;
          receipt_pdf_url?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_payments_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_payments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "sales_deals";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_commissions: {
        Row: {
          id: string;
          dealership_id: string;
          deal_id: string;
          sales_rep_id: string;
          commission_amount: number;
          calculation_basis: string;
          percentage_rate: number | null;
          is_approved: boolean;
          approved_by: string | null;
          approved_at: string | null;
          is_paid: boolean;
          paid_at: string | null;
          payment_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          deal_id: string;
          sales_rep_id: string;
          commission_amount: number;
          calculation_basis?: string;
          percentage_rate?: number | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          is_paid?: boolean;
          paid_at?: string | null;
          payment_ref?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          deal_id?: string;
          sales_rep_id?: string;
          commission_amount?: number;
          calculation_basis?: string;
          percentage_rate?: number | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          is_paid?: boolean;
          paid_at?: string | null;
          payment_ref?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_commissions_dealership_id_fkey";
            columns: ["dealership_id"];
            isOneToOne: false;
            referencedRelation: "dealerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_commissions_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "sales_deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_commissions_sales_rep_id_fkey";
            columns: ["sales_rep_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type TestDriveStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type FuelLevel =
  | "reserve"
  | "quarter"
  | "half"
  | "three_quarters"
  | "full";

export type CustomerInterestTier = "hot" | "warm" | "cold";

export type DealStatus =
  | "draft"
  | "token_booked"
  | "financing_pending"
  | "payment_cleared"
  | "delivered"
  | "rto_in_progress"
  | "completed"
  | "cancelled";

export type PaymentMethod =
  | "upi"
  | "bank_transfer"
  | "cheque"
  | "cash"
  | "card"
  | "auto_loan"
  | "exchange_trade_in";

export type PaymentType =
  | "token_deposit"
  | "down_payment"
  | "loan_disbursement"
  | "exchange_adjustment"
  | "final_settlement"
  | "refund";

export type PaymentStatus =
  | "pending_clearance"
  | "cleared"
  | "bounced"
  | "refunded";

export type RtoTransferStatus =
  | "pending_docs"
  | "docs_collected"
  | "submitted_to_rto"
  | "scrutiny_approved"
  | "rc_transferred"
  | "disputed";

export type ReconditioningCategory =
  | "mechanical_repair"
  | "bodywork_paint"
  | "detailing_ceramic"
  | "tyre_replacement"
  | "interior_restoration"
  | "electrical_battery"
  | "rto_paperwork_fines"
  | "transportation_towing"
  | "other";

export type VehicleExpense = Database["public"]["Tables"]["vehicle_expenses"]["Row"];
export type SalesDeal = Database["public"]["Tables"]["sales_deals"]["Row"];
export type DealPayment = Database["public"]["Tables"]["deal_payments"]["Row"];
export type DealCommission = Database["public"]["Tables"]["deal_commissions"]["Row"];



