export type Lang = 'pt' | 'en';

/** A localised string. Every user-facing copy lives in /data as `L`. */
export type L = Record<Lang, string>;

export type SectionId = 'top' | 'identity' | 'capabilities' | 'work' | 'trajectory' | 'contact';
