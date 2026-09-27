"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { consentServerSnapshot, consentSnapshot, subscribeConsent } from "../model/consent";

const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

/** Yandex Metrika (data stays in Russia). Loaded only after explicit consent. */
export function Analytics() {
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot);
  if (!counterId || consent !== "all") return null;
  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(counterId)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`}
    </Script>
  );
}
