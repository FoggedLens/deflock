import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cmsService } from '@/services/cmsService';
import type { LprVendor, OtherSurveillanceDevice } from '@/types';

export const useVendorStore = defineStore('vendorStore', () => {
  const lprVendors = ref<LprVendor[]>([]);
  const otherDevices = ref<OtherSurveillanceDevice[]>([]);

  async function loadAllVendors(): Promise<void> {
    if (lprVendors.value.length > 0) return;
    lprVendors.value = await cmsService.getLprVendors();
  }

  async function loadAllOtherDevices(): Promise<void> {
    if (otherDevices.value.length > 0) return;
    otherDevices.value = await cmsService.getOtherSurveillanceDevices();
  }

  async function getFirstImageForManufacturer(fullName: string): Promise<string | null> {
    const vendor = lprVendors.value.find(v => v.fullName === fullName);
    return vendor?.urls?.[0]?.url ?? null;
  }

  return { lprVendors, otherDevices, loadAllVendors, loadAllOtherDevices, getFirstImageForManufacturer };
});
