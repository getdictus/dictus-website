/**
 * The four Dictus Pro features of the section, in the mockup's order. Each
 * one ships in dictus-ios develop (`ProFeature.swift`) and has its own
 * onboarding scene, which its card draws (see `scenes/`).
 */
export const SMART_MODES_STEPS = ["smart", "vocabulary", "voiceNotes", "history"] as const;

export type SmartModesStep = (typeof SMART_MODES_STEPS)[number];
