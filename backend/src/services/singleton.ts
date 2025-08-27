import { DeviceRepository } from "../modules/DeviceModule/device.repository.js";
import { DeviceService } from "../modules/DeviceModule/device.service.js";
import { CacheService } from "./cacheService.js";

export const deviceRepo = new DeviceRepository()
export const cache = new CacheService()
export const deviceService = new DeviceService(deviceRepo, cache)