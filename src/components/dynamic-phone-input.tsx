"use client";

import dynamic from "next/dynamic";

export const DynamicPhoneInput = dynamic(
  () => import("./phone-input").then((mod) => mod.PhoneInput),
  {
    ssr: false,
  }
);
