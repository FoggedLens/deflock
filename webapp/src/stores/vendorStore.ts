import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cmsService } from '@/services/cmsService';
import type { LprVendor } from '@/types';

export const useVendorStore = defineStore('vendorStore', () => {
  const lprVendors = ref<LprVendor[]>([]);

  async function loadAllVendors(): Promise<void> {
    if (lprVendors.value.length > 0) return;
    lprVendors.value = await cmsService.getLprVendors();
  }

  async function getFirstImageForManufacturer(fullName: string): Promise<string | null> {
    const vendor = lprVendors.value.find(v => v.fullName === fullName);
    return vendor?.urls?.[0]?.url ?? null;
  }

  return { lprVendors, loadAllVendors, getFirstImageForManufacturer };
});
