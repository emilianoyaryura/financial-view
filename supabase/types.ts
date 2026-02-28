export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          email_verified?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          token?: string;
          expires_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          provider_id: string;
          access_token: string | null;
          refresh_token: string | null;
          access_token_expires_at: string | null;
          refresh_token_expires_at: string | null;
          scope: string | null;
          id_token: string | null;
          password: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          account_id: string;
          provider_id: string;
          access_token?: string | null;
          refresh_token?: string | null;
          access_token_expires_at?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          id_token?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          access_token?: string | null;
          refresh_token?: string | null;
          access_token_expires_at?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          id_token?: string | null;
          password?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      verifications: {
        Row: {
          id: string;
          identifier: string;
          value: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          identifier: string;
          value: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          identifier?: string;
          value?: string;
          expires_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          currency_display: string;
          dollar_type: string;
          theme: string;
          portfolio_columns: string[];
          dashboard_widgets: Record<string, unknown> | null;
          alert_email: string | null;
          weekly_summary_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          currency_display?: string;
          dollar_type?: string;
          theme?: string;
          portfolio_columns?: string[];
          dashboard_widgets?: Record<string, unknown> | null;
          alert_email?: string | null;
          weekly_summary_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          currency_display?: string;
          dollar_type?: string;
          theme?: string;
          portfolio_columns?: string[];
          dashboard_widgets?: Record<string, unknown> | null;
          alert_email?: string | null;
          weekly_summary_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      holdings: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          type: string;
          total_shares: number;
          avg_cost_usd: number;
          total_invested_usd: number;
          realized_pnl_usd: number;
          total_dividends_usd: number;
          cedear_ratio: string | null;
          first_buy_date: string | null;
          last_transaction_date: string | null;
          transaction_count: number;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          type: string;
          total_shares?: number;
          avg_cost_usd?: number;
          total_invested_usd?: number;
          realized_pnl_usd?: number;
          total_dividends_usd?: number;
          cedear_ratio?: string | null;
          first_buy_date?: string | null;
          last_transaction_date?: string | null;
          transaction_count?: number;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ticker?: string;
          type?: string;
          total_shares?: number;
          avg_cost_usd?: number;
          total_invested_usd?: number;
          realized_pnl_usd?: number;
          total_dividends_usd?: number;
          cedear_ratio?: string | null;
          first_buy_date?: string | null;
          last_transaction_date?: string | null;
          transaction_count?: number;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          holding_id: string;
          ticker: string;
          type: string;
          action: string;
          shares: number;
          price_per_share: number;
          price_usd: number;
          currency: string;
          exchange_rate: number | null;
          total_amount: number;
          total_amount_usd: number;
          commission: number | null;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          holding_id: string;
          ticker: string;
          type: string;
          action: string;
          shares: number;
          price_per_share: number;
          price_usd: number;
          currency: string;
          exchange_rate?: number | null;
          total_amount: number;
          total_amount_usd: number;
          commission?: number | null;
          date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          ticker?: string;
          type?: string;
          action?: string;
          shares?: number;
          price_per_share?: number;
          price_usd?: number;
          currency?: string;
          exchange_rate?: number | null;
          total_amount?: number;
          total_amount_usd?: number;
          commission?: number | null;
          date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      dividends: {
        Row: {
          id: string;
          user_id: string;
          holding_id: string;
          ticker: string;
          amount_per_share: number;
          total_shares_at_date: number;
          total_amount: number;
          total_amount_usd: number;
          currency: string;
          exchange_rate: number | null;
          ex_dividend_date: string | null;
          payment_date: string | null;
          is_estimated: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          holding_id: string;
          ticker: string;
          amount_per_share: number;
          total_shares_at_date: number;
          total_amount: number;
          total_amount_usd: number;
          currency: string;
          exchange_rate?: number | null;
          ex_dividend_date?: string | null;
          payment_date?: string | null;
          is_estimated?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          ticker?: string;
          amount_per_share?: number;
          total_shares_at_date?: number;
          total_amount?: number;
          total_amount_usd?: number;
          currency?: string;
          exchange_rate?: number | null;
          ex_dividend_date?: string | null;
          payment_date?: string | null;
          is_estimated?: boolean;
          notes?: string | null;
        };
        Relationships: [];
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          notes: string | null;
          target_buy_price: number | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          notes?: string | null;
          target_buy_price?: number | null;
          added_at?: string;
        };
        Update: {
          ticker?: string;
          notes?: string | null;
          target_buy_price?: number | null;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          ticker: string;
          condition: string;
          target_price: number;
          currency: string;
          is_active: boolean;
          triggered_at: string | null;
          notification_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker: string;
          condition: string;
          target_price: number;
          currency: string;
          is_active?: boolean;
          triggered_at?: string | null;
          notification_sent?: boolean;
          created_at?: string;
        };
        Update: {
          ticker?: string;
          condition?: string;
          target_price?: number;
          currency?: string;
          is_active?: boolean;
          triggered_at?: string | null;
          notification_sent?: boolean;
        };
        Relationships: [];
      };
      cedear_ratios: {
        Row: {
          id: string;
          ticker: string;
          name: string;
          ratio: number;
          market: string | null;
          underlying_type: string | null;
          country: string | null;
          industry: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticker: string;
          name: string;
          ratio: number;
          market?: string | null;
          underlying_type?: string | null;
          country?: string | null;
          industry?: string | null;
          updated_at?: string;
        };
        Update: {
          ticker?: string;
          name?: string;
          ratio?: number;
          market?: string | null;
          underlying_type?: string | null;
          country?: string | null;
          industry?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
