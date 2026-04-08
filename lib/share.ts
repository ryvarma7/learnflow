import LZString from 'lz-string';
import { RoadmapData, UserPreferences } from './types';

export function encodeRoadmap(roadmap: RoadmapData, prefs: UserPreferences): string {
  const payload = JSON.stringify({ roadmap, prefs })
  const compressed = LZString.compressToEncodedURIComponent(payload)
  return compressed
}

export function decodeRoadmap(param: string): { roadmap: RoadmapData, prefs: UserPreferences } | null {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(param)
    if (!decompressed) return null;
    return JSON.parse(decompressed)
  } catch { 
    return null 
  }
}
