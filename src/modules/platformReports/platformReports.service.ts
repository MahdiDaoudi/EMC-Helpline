
import * as platformReportsRepository from "./platformReports.repository";
import { CreatePlatformReportDto, UpdatePlatformReportDto } from "./platformReports.schema";

export function getAllPlatformReports() {
    return platformReportsRepository.findAll();
}

export function getPlatformReportById(id: number) {
    return platformReportsRepository.findById(id);
}

export function addPlatformReport(data: CreatePlatformReportDto) {
    return platformReportsRepository.create(data);
}

export function updatePlatformReport(id: number, data: UpdatePlatformReportDto) {
    return platformReportsRepository.update(id, data);
}

export function deletePlatformReport(id: number) {
    return platformReportsRepository.deleteById(id);
}