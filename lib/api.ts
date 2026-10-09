import { Workshop, SiteSettings, StoredRegistration } from "./types";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://metaquestsolutions.vercel.app";

export async function fetchSiteData(): Promise<{
  success: boolean;
  siteSettings: SiteSettings;
  workshops: Workshop[];
}> {
  const res = await fetch(`${BACKEND_URL}/api/public/site-data`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch site data`);
  return res.json();
}

export async function fetchWorkshops(): Promise<Workshop[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/workshops`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch workshops`);
  const data = await res.json();
  return data.workshops || [];
}

export async function saveWorkshop(workshop: Workshop): Promise<Workshop[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/workshops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workshop }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to save workshop`);
  const data = await res.json();
  return data.workshops || [];
}

export async function deleteWorkshop(id: string): Promise<Workshop[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/workshops?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete workshop`);
  const data = await res.json();
  return data.workshops || [];
}

export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch settings`);
  const data = await res.json();
  return data.settings;
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update settings`);
  const data = await res.json();
  return data.settings;
}

export async function fetchRegistrations(): Promise<StoredRegistration[]> {
  const res = await fetch(`${BACKEND_URL}/api/admin/registrations`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch registrations`);
  const data = await res.json();
  return data.registrations || [];
}
