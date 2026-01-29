import type { LprVendor, OtherSurveillanceDevice } from "@/types";
import axios from "axios";

export interface Chapter {
	id: string;
	name: string;
	city: string;
	state: string;
	website: string;
}

export interface ChaptersResponse {
	data: Chapter[];
	meta?: {
		total_count: number;
		filter_count: number;
	};
}

const CMS_BASE_URL = "https://cms.deflock.me";

const cmsApiService = axios.create({
	baseURL: CMS_BASE_URL,
	timeout: 10000,
});

export const cmsService = {
	async getChapters(): Promise<Chapter[]> {
		try {
			const response = await cmsApiService.get("/items/chapters?sort=name");
			return response.data.data;
		} catch (error) {
			console.error("Error fetching chapters:", error);
			throw new Error("Failed to fetch chapters");
		}
	},
	async getLprVendors(): Promise<LprVendor[]> {
		try {
			const response = await cmsApiService.get("/items/lprVendors");
			return response.data.data as LprVendor[];
		} catch (error) {
			console.error("Error fetching LPR vendors:", error);
			throw new Error("Failed to fetch LPR vendors");
		}
	},
	async getOtherSurveillanceDevices(): Promise<OtherSurveillanceDevice[]> {
		try {
			const response = await cmsApiService.get("/items/nonLprVendors");
			return response.data.data as OtherSurveillanceDevice[];
		} catch (error) {
			console.error("Error fetching other surveillance devices:", error);
			throw new Error("Failed to fetch other surveillance devices");
		}
	}
};
