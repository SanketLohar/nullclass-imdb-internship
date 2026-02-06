import { Actor } from "@/data/actors.types";

type Locale = "en" | "es" | "fr" | "de";

const DICTIONARIES: Record<Locale, Record<string, string>> = {
    en: {
        birthPlace_prefix: "Born in",
        role_actor: "Actor",
        role_director: "Director",
        unknown: "Unknown",
    },
    es: {
        birthPlace_prefix: "Nacido en",
        role_actor: "Actor",
        role_director: "Director",
        unknown: "Desconocido",
    },
    fr: {
        birthPlace_prefix: "Né à",
        role_actor: "Acteur",
        role_director: "Réalisateur",
        unknown: "Inconnu",
    },
    de: {
        birthPlace_prefix: "Geboren in",
        role_actor: "Schauspieler",
        role_director: "Regisseur",
        unknown: "Unbekannt",
    },
};

export function getActorLocalizedLabel(key: string, locale: string = "en"): string {
    const dict = DICTIONARIES[locale as Locale] || DICTIONARIES["en"];
    return dict[key] || key;
}

export function formatBirthPlace(actor: Actor, locale: string = "en"): string {
    const prefix = getActorLocalizedLabel("birthPlace_prefix", locale);
    return actor.birthPlace ? `${prefix} ${actor.birthPlace}` : getActorLocalizedLabel("unknown", locale);
}
