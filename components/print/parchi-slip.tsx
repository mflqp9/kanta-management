import { Num } from "@/components/num"
import { BUSINESS, DEVELOPER } from "@/lib/config"
import { mannAurKilo } from "@/lib/calc"
import type { ParchiWithRelations } from "@/lib/database.types"
import {
  JINSS_LABEL,
  formatKg,
  formatMann,
  formatRaqam,
  formatTareekh,
  formatWaqt,
  katautiKiTafseel,
  partyKaNaam,
} from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * 80mm تھرمل پرنٹر کے لیے اردو وزن پرچی۔
 * رنگ جان بوجھ کر ہمیشہ کالا/سفید ہیں — اسکرین پر نمونہ بھی کاغذ جیسا دکھتا ہے۔
 */
export function ParchiSlip({ parchi, copy }: { parchi: ParchiWithRelations; copy?: string }) {
  const { mann, kilo } = mannAurKilo(parchi.khalis_wazan_kg)
  const katautiRaqam = parchi.kul_raqam - parchi.final_raqam
  const katauti = katautiKiTafseel(parchi)

  return (
    <div dir="rtl" lang="ur" className="mx-auto w-[72mm] bg-white px-[1mm] py-[3mm] font-sans text-[10.5pt] leading-[1.75] text-black">
      <header className="text-center">
        <div className="text-[15pt] font-bold leading-[1.6]">{BUSINESS.naam}</div>
        <div className="text-[8.5pt]">{BUSINESS.pata}</div>
        {BUSINESS.phone && (
          <div className="text-[8.5pt]">
            فون: <Num>{BUSINESS.phone}</Num>
          </div>
        )}
      </header>

      <Divider />

      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[13pt] font-bold">وزن پرچی {copy && <span className="text-[8.5pt] font-normal">({copy})</span>}</div>
          <div className="text-[8.5pt]">
            {formatTareekh(parchi.tareekh)} · {formatWaqt(parchi.created_at)}
          </div>
        </div>
        <div className="rounded-[1.5mm] border-[0.5mm] border-black px-[2mm] py-[0.5mm] text-center">
          <div className="text-[7.5pt] leading-[1.6]">ٹوکن نمبر</div>
          <Num className="text-[17pt] font-bold leading-[1.15]">{parchi.token_number}</Num>
        </div>
      </div>

      <Divider />

      <Row label="جنس" value={JINSS_LABEL[parchi.jinss]} strong />
      <Row label="کسان" value={partyKaNaam(parchi.kisan)} />
      {parchi.kisan?.gaon && <Row label="گاؤں" value={parchi.kisan.gaon} />}
      {parchi.kisan?.mobile_number && <Row label="موبائل" value={<Num>{parchi.kisan.mobile_number}</Num>} />}
      {parchi.gaari && <Row label="گاڑی نمبر" value={<Num>{parchi.gaari.gaari_number}</Num>} />}
      {parchi.gaari?.driver_ka_naam && <Row label="ڈرائیور" value={parchi.gaari.driver_ka_naam} />}
      {parchi.mill && <Row label="مل" value={parchi.mill.mill_ka_naam} />}
      {parchi.serial_number && <Row label="سیریل" value={<Num>{parchi.serial_number}</Num>} />}

      <Divider />

      <Row label="کل وزن" value={<Unit n={formatKg(parchi.kul_wazan_kg)} unit="کلو" />} />
      <Row label="خالی گاڑی وزن" value={<Unit n={formatKg(parchi.khali_gaari_wazan_kg)} unit="کلو" />} />
      <Row label="خالص وزن" value={<Unit n={formatKg(parchi.khalis_wazan_kg)} unit="کلو" />} strong />
      <Row label="وزن من میں" value={<Unit n={formatMann(parchi.wazan_mann)} unit="من" />} strong />
      <div className="text-start text-[8.5pt]">
        ({<Num>{mann}</Num>} من {<Num>{formatKg(kilo)}</Num>} کلو)
      </div>

      <Divider />

      <Row label="ریٹ فی من" value={<Unit n={formatRaqam(parchi.fee_mann_rate)} unit="روپے" />} />
      <Row label="کل رقم" value={<Unit n={formatRaqam(parchi.kul_raqam)} unit="روپے" />} />
      {parchi.mill_katauti_mann > 0 && (
        <Row
          label="مل کٹوتی"
          value={
            <span>
              <Unit {...katauti} /> ={" "}
              <Unit n={formatRaqam(katautiRaqam)} unit="روپے" />
            </span>
          }
        />
      )}

      <div className="mt-[1.5mm] flex items-center justify-between rounded-[1.5mm] border-[0.5mm] border-black px-[2mm] py-[0.5mm]">
        <span className="text-[11pt] font-bold">صافی رقم</span>
        <span className="text-[14pt] font-bold">
          <Unit n={formatRaqam(parchi.final_raqam)} unit="روپے" />
        </span>
      </div>

      {parchi.remarks && (
        <div className="mt-[1.5mm] text-[9pt]">
          <span className="font-bold">ریمارکس: </span>
          {parchi.remarks}
        </div>
      )}

      <div className="mt-[9mm] flex justify-between gap-[4mm] text-center text-[8.5pt]">
        <div className="flex-1 border-t border-black pt-[0.5mm]">دستخط منشی</div>
        <div className="flex-1 border-t border-black pt-[0.5mm]">دستخط کسان / ڈرائیور</div>
      </div>

      <Divider dashed />
      <div className="text-center text-[8.5pt]">شکریہ! یہ پرچی سنبھال کر رکھیں</div>

      {/* بنانے والے کا نام — مالک کی ہدایت پر انگریزی میں، سب سے نیچے */}
      <div dir="ltr" lang="en" className="mt-[1.5mm] border-t border-black pt-[1mm] text-center font-num text-[7.5pt] leading-[1.5]">
        <div>Software developed by {DEVELOPER.naam}</div>
        <div>
          {DEVELOPER.website} | {DEVELOPER.phone}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-[2mm]", strong && "font-bold")}>
      <span className="shrink-0">{label}</span>
      <span className="text-end">{value}</span>
    </div>
  )
}

function Unit({ n, unit }: { n: string; unit: string }) {
  return (
    <span className="whitespace-nowrap">
      <Num>{n}</Num> <span className="text-[0.85em]">{unit}</span>
    </span>
  )
}

function Divider({ dashed }: { dashed?: boolean }) {
  return <div className={cn("my-[1.5mm] border-t border-black", dashed && "border-dashed")} />
}
