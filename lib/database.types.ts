// supabase/schema.sql کے مطابق ٹائپس۔ اسکیما بدلیں تو یہ فائل بھی بدلیں
// (یا: npx supabase gen types typescript --project-id <id> > lib/database.types.ts)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Jinss = "ganna" | "kapaas" | "gandum" | "chawal" | "sarson" | "til" | "digar"

/** مل کٹوتی کس اکائی میں لکھی گئی */
export type KatautiUnit = "kg" | "mann"

/** پارٹی کا walid_ka_naam والد کا نام ہے یا ریفرینس (حوالہ دینے والے) کا */
export type Nisbat = "walid" | "reference"

export type Database = {
  public: {
    Tables: {
      parties: {
        Row: {
          id: string
          naam: string
          /** کھاتہ نمبر — ڈیٹا بیس خود ترتیب وار دیتا ہے */
          khata_number: number
          walid_ka_naam: string | null
          /** walid_ka_naam والد کا نام ہے یا ریفرینس کا */
          nisbat: Nisbat
          mobile_number: string | null
          /** دوسرا موبائل نمبر (اختیاری) */
          mobile_number_2: string | null
          gaon: string | null
          qism: string | null
          /** ضمانتی کاغذات کی تفصیل (چیک، اسٹامپ پیپر وغیرہ) */
          zamanat: string | null
          created_at: string
        }
        Insert: {
          id?: string
          khata_number?: number
          naam: string
          walid_ka_naam?: string | null
          nisbat?: Nisbat
          mobile_number?: string | null
          mobile_number_2?: string | null
          gaon?: string | null
          qism?: string | null
          zamanat?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["parties"]["Insert"]>
        Relationships: []
      }
      gaariyan: {
        Row: {
          id: string
          gaari_number: string
          driver_ka_naam: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gaari_number: string
          driver_ka_naam?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["gaariyan"]["Insert"]>
        Relationships: []
      }
      mills: {
        Row: {
          id: string
          mill_ka_naam: string
          rate_per_mann: number
          katauti_rule: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mill_ka_naam: string
          rate_per_mann?: number
          katauti_rule?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["mills"]["Insert"]>
        Relationships: []
      }
      wazan_parchi: {
        Row: {
          id: string
          token_number: number
          tareekh: string
          jinss: Jinss
          kisan_id: string
          gaari_id: string | null
          mill_id: string | null
          kul_wazan_kg: number
          khali_gaari_wazan_kg: number
          khalis_wazan_kg: number
          wazan_mann: number
          fee_mann_rate: number
          kul_raqam: number
          mill_katauti_mann: number
          final_raqam: number
          remarks: string | null
          serial_number: string | null
          mill_katauti_unit: KatautiUnit
          /** خودکار کالم: mill_katauti_mann × 40 */
          mill_katauti_kg: number
          created_at: string
        }
        Insert: {
          id?: string
          token_number?: number
          tareekh?: string
          jinss: Jinss
          kisan_id: string
          gaari_id?: string | null
          mill_id?: string | null
          kul_wazan_kg: number
          khali_gaari_wazan_kg?: number
          khalis_wazan_kg?: number
          wazan_mann?: number
          fee_mann_rate?: number
          kul_raqam?: number
          mill_katauti_mann?: number
          final_raqam?: number
          remarks?: string | null
          serial_number?: string | null
          mill_katauti_unit?: KatautiUnit
          mill_katauti_kg?: never
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["wazan_parchi"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "wazan_parchi_kisan_id_fkey"
            columns: ["kisan_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wazan_parchi_gaari_id_fkey"
            columns: ["gaari_id"]
            isOneToOne: false
            referencedRelation: "gaariyan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wazan_parchi_mill_id_fkey"
            columns: ["mill_id"]
            isOneToOne: false
            referencedRelation: "mills"
            referencedColumns: ["id"]
          },
        ]
      }
      mulazmeen: {
        Row: {
          id: string
          naam: string
          ohda: string | null
          mahana_tankhwah: number
          /** ملازمت شروع کرنے کی تاریخ "YYYY-MM-DD" */
          joining_tareekh: string | null
          /** ملازمت چھوڑنے کی تاریخ — null = ابھی کام کر رہا ہے */
          leaving_tareekh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          naam: string
          ohda?: string | null
          mahana_tankhwah?: number
          joining_tareekh?: string | null
          leaving_tareekh?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["mulazmeen"]["Insert"]>
        Relationships: []
      }
      khata_ledger: {
        Row: {
          id: string
          tareekh: string
          party_id: string
          tafseel: string | null
          jama: number
          banam: number
          qism: string | null
          parchi_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tareekh?: string
          party_id: string
          tafseel?: string | null
          jama?: number
          banam?: number
          qism?: string | null
          parchi_id?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["khata_ledger"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "khata_ledger_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khata_ledger_parchi_id_fkey"
            columns: ["parchi_id"]
            isOneToOne: true
            referencedRelation: "wazan_parchi"
            referencedColumns: ["id"]
          },
        ]
      }
      mill_tarseel: {
        Row: {
          id: string
          /** ترسیل نمبر — ڈیٹا بیس خود ترتیب وار دیتا ہے */
          tarseel_number: number
          tareekh: string
          party_id: string | null
          khata_daar_naam: string
          mill_id: string | null
          mill_naam: string
          token_number: string | null
          gaari_number: string | null
          driver_naam: string | null
          driver_mobile: string | null
          builty_adda: string | null
          permit_number: string | null
          variety: string | null
          kul_wazan_kg: number
          katauti_kg: number
          /** خودکار: kul_wazan_kg - katauti_kg */
          saafi_wazan_kg: number
          rate: number
          gaari_kiraya: number
          mill_kiraya: number
          baqaya_saafi_raqam: number
          bank_naam: string | null
          online_raqam: number
          /** خودکار: baqaya_saafi_raqam - online_raqam */
          baqaya_jaat: number
          created_at: string
        }
        Insert: {
          id?: string
          tarseel_number?: number
          tareekh?: string
          party_id?: string | null
          khata_daar_naam: string
          mill_id?: string | null
          mill_naam: string
          token_number?: string | null
          gaari_number?: string | null
          driver_naam?: string | null
          driver_mobile?: string | null
          builty_adda?: string | null
          permit_number?: string | null
          variety?: string | null
          kul_wazan_kg: number
          katauti_kg?: number
          saafi_wazan_kg?: never
          rate?: number
          gaari_kiraya?: number
          mill_kiraya?: number
          baqaya_saafi_raqam?: number
          bank_naam?: string | null
          online_raqam?: number
          baqaya_jaat?: never
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["mill_tarseel"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "mill_tarseel_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mill_tarseel_mill_id_fkey"
            columns: ["mill_id"]
            isOneToOne: false
            referencedRelation: "mills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      party_baqaya: {
        Row: {
          id: string
          naam: string
          walid_ka_naam: string | null
          gaon: string | null
          mobile_number: string | null
          qism: string | null
          kul_jama: number
          kul_banam: number
          baqaya: number
          indraj_count: number
          aakhri_tareekh: string | null
          nisbat: Nisbat
          khata_number: number
          mobile_number_2: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      dashboard_stats: {
        Args: { p_tareekh: string }
        Returns: {
          ganna_kg: number
          ganna_mann: number
          kapaas_kg: number
          kapaas_mann: number
          parchi_count: number
          aaj_ki_aamdan: number
          kul_baqaya: number
        }[]
      }
      dashboard_jinss_wazan: {
        Args: { p_tareekh: string }
        Returns: {
          jinss: Jinss
          parchi_count: number
          khalis_wazan_kg: number
          wazan_mann: number
          final_raqam: number
        }[]
      }
      report_mill_wise: {
        Args: { p_from: string; p_to: string; p_jinss?: string | null }
        Returns: {
          mill_id: string | null
          mill_ka_naam: string
          parchi_count: number
          khalis_wazan_kg: number
          wazan_mann: number
          katauti_mann: number
          kul_raqam: number
          final_raqam: number
        }[]
      }
      report_baqaya: {
        Args: { p_from: string; p_to: string }
        Returns: {
          party_id: string
          naam: string
          walid_ka_naam: string | null
          gaon: string | null
          mobile_number: string | null
          sabiqa_baqaya: number
          jama: number
          banam: number
          baqaya: number
        }[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database["public"]

export type TableName = keyof PublicSchema["Tables"]
export type Tables<T extends TableName> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"]
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"]
export type RpcReturn<T extends keyof PublicSchema["Functions"]> = PublicSchema["Functions"][T]["Returns"]

export type Party = Tables<"parties">
export type Gaari = Tables<"gaariyan">
export type Mill = Tables<"mills">
export type WazanParchi = Tables<"wazan_parchi">
export type Mulazim = Tables<"mulazmeen">
export type KhataIndraj = Tables<"khata_ledger">
export type PartyBaqaya = Views<"party_baqaya">
export type MillTarseel = Tables<"mill_tarseel">

/** مل ترسیل کے ساتھ منتخب پارٹی اور مل کی تازہ تفصیل (نام بدلے تو یہاں بھی نیا) */
export type MillTarseelWithRelations = MillTarseel & {
  party: Pick<Party, "naam" | "walid_ka_naam" | "nisbat" | "khata_number"> | null
  mill: Pick<Mill, "mill_ka_naam"> | null
}

export const MILL_TARSEEL_SELECT =
  "*, party:parties(naam, walid_ka_naam, nisbat, khata_number), mill:mills(mill_ka_naam)" as const

/** پرچی کے ساتھ کسان، گاڑی اور مل کی تفصیل (پرنٹ اور فہرستوں کے لیے) */
export type ParchiWithRelations = WazanParchi & {
  kisan: Pick<Party, "naam" | "walid_ka_naam" | "nisbat" | "gaon" | "mobile_number"> | null
  gaari: Pick<Gaari, "gaari_number" | "driver_ka_naam"> | null
  mill: Pick<Mill, "mill_ka_naam"> | null
}

export const PARCHI_SELECT =
  "*, kisan:parties(naam, walid_ka_naam, nisbat, gaon, mobile_number), gaari:gaariyan(gaari_number, driver_ka_naam), mill:mills(mill_ka_naam)" as const
