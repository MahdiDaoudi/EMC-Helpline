
import * as screenshotsRepository from "./screenshots.repository";
import { CreateScreenshotDto, UpdateScreenshotDto } from "./screenshots.schema";

export function getAllScreenshots() {
    return screenshotsRepository.findAll();
}

export function getScreenshotById(id: number) {
    return screenshotsRepository.findById(id);
}

export function addScreenshot(data: CreateScreenshotDto) {
    return screenshotsRepository.create(data);
}

export function updateScreenshot(id: number, data: UpdateScreenshotDto) {
    return screenshotsRepository.update(id, data);
}

export function deleteScreenshot(id: number) {
    return screenshotsRepository.deleteById(id);
}