"use client"

import { useEffect } from "react"

/*
 * A4 پرنٹ کا صفحہ (سائز، حاشیہ، نیچے صفحہ نمبر)۔
 * CSS کے «نام والے صفحے» (page: …) ایپ کے flex لے آؤٹ میں Chrome پوری طرح نہیں مانتا
 * (صفحہ نمبر صرف پہلے صفحے پر، آڑا سائز نہیں لگتا)، اس لیے جو صفحہ کھلا ہو وہی اپنا @page
 * اصول head میں لگاتا ہے اور صفحہ بند / چھپتے ہی (React Activity) ہٹا دیتا ہے۔
 */

const SAFHA_NUMBER = `
  @bottom-center {
    content: "صفحہ " counter(page) " از " counter(pages);
    font-family: var(--font-nastaliq), var(--font-geist-sans), serif;
    font-size: 8pt;
    color: #000;
  }`

/** کھاتہ، رپورٹس، رہنمائی: A4 کھڑا، ہر صفحے کے نیچے «صفحہ 1 از 3» */
export const A4_REPORT_PAGE = `@page { size: A4 portrait; margin: 12mm 12mm 16mm; ${SAFHA_NUMBER} }`

/** مل ترسیل رجسٹر (21 کالم): A4 آڑا، دائیں بائیں تقریباً کوئی حاشیہ نہیں */
export const MILL_REGISTER_PAGE = `@page { size: A4 landscape; margin: 5mm 3mm 9mm; ${SAFHA_NUMBER} }`

/** یہ صفحہ نظر آ رہا ہو تب تک پرنٹ کا @page اصول لگا رہے */
export function usePrintPage(css: string) {
  useEffect(() => {
    const style = document.createElement("style")
    style.dataset.printPage = ""
    style.textContent = css
    document.head.append(style)
    return () => style.remove()
  }, [css])
}
