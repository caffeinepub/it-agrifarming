import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PlantNeed {
    status: NeedStatus;
    description: string;
    category: NeedCategory;
}
export interface Plant {
    id: string;
    emotion: PlantEmotion;
    name: string;
    needs: PlantNeeds;
    photo: ExternalBlob;
}
export type PlantNeeds = Array<PlantNeed>;
export interface PlantInput {
    name: string;
    photo: ExternalBlob;
}
export enum NeedCategory {
    sunlight = "sunlight",
    soil = "soil",
    water = "water",
    pestPresence = "pestPresence",
    airQuality = "airQuality"
}
export enum NeedStatus {
    needsAttention = "needsAttention",
    good = "good"
}
export enum PlantEmotion {
    sad = "sad",
    happy = "happy",
    angry = "angry",
    worried = "worried",
    upset = "upset"
}
export interface backendInterface {
    assessPlant(input: PlantInput): Promise<Plant>;
    uploadPhoto(_blob: ExternalBlob): Promise<ExternalBlob>;
}
