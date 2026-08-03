
import * as reportedItemsRepository from "./reportedItems.repository";
import { CreateReportedItemDto, UpdateReportedItemDto } from "./reportedItems.schema";

export function getAllReportedItems() {
    return reportedItemsRepository.findAll();
}

export function getReportedItemById(id: number) {
    return reportedItemsRepository.findById(id);
}

export function addReportedItem(data: CreateReportedItemDto) {
    return reportedItemsRepository.create(data);
}

export function updateReportedItem(id: number, data: UpdateReportedItemDto) {
    return reportedItemsRepository.update(id, data);
}

export function deleteReportedItem(id: number) {
    return reportedItemsRepository.deleteById(id);
}