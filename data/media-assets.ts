export type NewsArticle = {
  id: string;
  title: string;
  href: string;
  publishedAt: string;
};

export type MediaClip = {
  id: string;
  title: string;
  href: string;
  youtubeId: string;
};

export type PodcastEpisode = {
  id: string;
  title: string;
  href: string;
  youtubeId: string;
};

/** News articles — newest first (Juego Todo Media Digital Assets). */
export const newsArticles: NewsArticle[] = [
  {
    id: "news-1",
    title: "Juego Todo: Aeon Luxe backs Pinoy-style MMA",
    href: "https://drive.google.com/file/d/1DIq44yct2nQwL3kzLIH0VkCO8vo4SHQC/view?usp=drivesdk",
    publishedAt: "2026-03-15",
  },
  {
    id: "news-2",
    title: "Indigeneous Pinoy MMA",
    href: "https://drive.google.com/file/d/1uuVglX8663s3-tVS1seZ-g2ihGjA80SH/view?usp=drivesdk",
    publishedAt: "2026-02-20",
  },
  {
    id: "news-3",
    title: "Gloves Off",
    href: "https://drive.google.com/file/d/11r0U7Sg81wh2U131c-m15yiVI8d_oxTT/view?usp=drivesdk",
    publishedAt: "2026-01-10",
  },
  {
    id: "news-4",
    title:
      "JUEGO TODO: INGENIOUS, INDIGENOUS — A Filipino-bred weaponized sport of cage fighting is out to claim its place in the MMA sun",
    href: "https://drive.google.com/file/d/1G6WiXY5i64SX99flYfV38hl-V32DVt6y/view?usp=drivesdk",
    publishedAt: "2025-11-05",
  },
];

/** YouTube media clips — newest first. */
export const mediaClips: MediaClip[] = [
  { id: "clip-1", title: "Sta. Lucia Barrio Brawls - Padollon vs Domingo", href: "https://youtube.com/shorts/gxOIya_f7AE", youtubeId: "gxOIya_f7AE" },
  { id: "clip-2", title: "Blaze FC Sta. Lucia Barrio Brawls", href: "https://youtube.com/shorts/4j9APh-hyx8", youtubeId: "4j9APh-hyx8" },
  { id: "clip-3", title: "Sta. Lucia Barrio Brawls - Gallanosa vs Obiena", href: "https://youtube.com/shorts/ZU1YtrJqu_8", youtubeId: "ZU1YtrJqu_8" },
  { id: "clip-4", title: "Not for the weak - Juego Todo Warriors only", href: "https://youtube.com/shorts/RUDvHg5lwKA", youtubeId: "RUDvHg5lwKA" },
  { id: "clip-5", title: "One of the most intense battles ever witnessed in Juego Todo", href: "https://youtube.com/shorts/Zp8ofvjlhlg", youtubeId: "Zp8ofvjlhlg" },
  { id: "clip-6", title: "Grabe, Naputol! Ang lakas. Bacus vs Francisco", href: "https://youtu.be/4GO9iezTgFo", youtubeId: "4GO9iezTgFo" },
  { id: "clip-7", title: 'GM Monsod "Boyka" Cadalso returns to the cage.', href: "https://youtube.com/shorts/dg9yFIFRRt8", youtubeId: "dg9yFIFRRt8" },
  { id: "clip-8", title: 'Marwin "Subano" Landong', href: "https://youtu.be/IWlSJwI7rJM", youtubeId: "IWlSJwI7rJM" },
  { id: "clip-9", title: "Sta. Lucia Barrio Brawls - Juego Todo Laban ng Lahat", href: "https://youtu.be/mllcv6cCraU", youtubeId: "mllcv6cCraU" },
  { id: "clip-10", title: "UGB BOOTHCAMP", href: "https://youtu.be/kM2oCO5mn2c", youtubeId: "kM2oCO5mn2c" },
  { id: "clip-11", title: "Sta. Lucia Barrio Brawls Get your tickets now", href: "https://youtu.be/Zz2McyuWC1c", youtubeId: "Zz2McyuWC1c" },
  { id: "clip-12", title: "August 28, 2026 - History Continues", href: "https://youtu.be/_nVZwrW4svY", youtubeId: "_nVZwrW4svY" },
  { id: "clip-13", title: "Mindanao vs Mindanao (Landong vs Quiñonero)", href: "https://youtu.be/ArUcXt9wOv8", youtubeId: "ArUcXt9wOv8" },
  { id: "clip-14", title: "The Monkey King Is Back!!", href: "https://youtube.com/shorts/80B58Z0LvII", youtubeId: "80B58Z0LvII" },
  { id: "clip-15", title: "Sarap mag JUEGO TODO", href: "https://youtube.com/shorts/GCarWnDHkts", youtubeId: "GCarWnDHkts" },
  { id: "clip-16", title: "Bakit mo kinain... Ulam ko yan!!!", href: "https://youtube.com/shorts/tnZYa3no75E", youtubeId: "tnZYa3no75E" },
  { id: "clip-17", title: "Ang tibay ng ano... Pinang salag.", href: "https://youtube.com/shorts/uLlTPzSzwmo", youtubeId: "uLlTPzSzwmo" },
  { id: "clip-18", title: "Palo sa ulo", href: "https://youtube.com/shorts/uLlTPzSzwmo", youtubeId: "uLlTPzSzwmo" },
  { id: "clip-19", title: "I have to be something different.", href: "https://youtube.com/shorts/2CK6JKoxILs", youtubeId: "2CK6JKoxILs" },
  { id: "clip-20", title: "Did you Know? was conceptualized in 2014, there was already fight promotion called UGB MMA", href: "https://youtu.be/0Konj1pbdmU", youtubeId: "0Konj1pbdmU" },
  { id: "clip-21", title: "JUEGO TODO HONORING THE MASTERS. ARNISADOR ARE THE BEST", href: "https://youtube.com/shorts/klIfCMrpR8w", youtubeId: "klIfCMrpR8w" },
  { id: "clip-22", title: "Wag diyan!!!", href: "https://youtu.be/-XZdREuL7mY", youtubeId: "-XZdREuL7mY" },
  { id: "clip-23", title: "Ok kalang? Kaya mo pa?", href: "https://youtu.be/YcNFLZ0SFNI", youtubeId: "YcNFLZ0SFNI" },
  { id: "clip-24", title: "Kanino mas bagay?", href: "https://youtube.com/shorts/RhPPHGGuGbk", youtubeId: "RhPPHGGuGbk" },
  { id: "clip-25", title: "Spider-Man - will fight Juego Todo", href: "https://youtube.com/shorts/GcdQSnjz39o", youtubeId: "GcdQSnjz39o" },
  { id: "clip-26", title: "GM Casiño, Master Celones", href: "https://youtube.com/shorts/gXaX0SZuPhY", youtubeId: "gXaX0SZuPhY" },
  { id: "clip-27", title: "The LIVING LEGACY GRAND MASTER RENE CASIÑO", href: "https://youtube.com/shorts/OCRQtrntGZU", youtubeId: "OCRQtrntGZU" },
  { id: "clip-28", title: "GRAND MASTER RENE CASIÑO", href: "https://youtube.com/shorts/Yl94c_IxUeU", youtubeId: "Yl94c_IxUeU" },
  { id: "clip-29", title: "Juego Todo 2025 Ultimate Showdown", href: "https://youtube.com/shorts/Xj76z8f9aTU", youtubeId: "Xj76z8f9aTU" },
  { id: "clip-30", title: "Will Marwin Landong become the very first Professional Juego Todo Star", href: "https://youtube.com/shorts/YetSCxvBeCw", youtubeId: "YetSCxvBeCw" },
  { id: "clip-31", title: "Sa laban mananalo ka kapag magaling ang Coach mo, Training Partner at Camp mo", href: "https://youtube.com/shorts/bDBlmeiAFd8", youtubeId: "bDBlmeiAFd8" },
  { id: "clip-32", title: "Ang tunay na fighter Natatalo sa loob ng cage, Pero hindi sa buhay. - Master Alberto Gaufo", href: "https://youtube.com/shorts/KxiEpJJykXk", youtubeId: "KxiEpJJykXk" },
  { id: "clip-33", title: "Giving credit where it's due.", href: "https://youtube.com/shorts/RWv2JhjvCg8", youtubeId: "RWv2JhjvCg8" },
  { id: "clip-34", title: "This how we give PRESTIGE. This how we create Exposure. This how build Stars.", href: "https://youtube.com/shorts/xvqtg6AL_7k", youtubeId: "xvqtg6AL_7k" },
  { id: "clip-35", title: "Lahat ay Babanggain Sa JUEGO TODO", href: "https://youtube.com/shorts/GCdLCA1Ilrc", youtubeId: "GCdLCA1Ilrc" },
  { id: "clip-36", title: "Who will be hailed the 1st Professional Juego Todo Superstar?", href: "https://youtube.com/shorts/FgKluPksMbc", youtubeId: "FgKluPksMbc" },
  { id: "clip-37", title: "GOOSEBUMPS APRIL 25, 2025 JUEGO TODO COMPILATIONS", href: "https://youtube.com/shorts/vCA9xcQyZJY", youtubeId: "vCA9xcQyZJY" },
];

/** Goatism podcast episodes — newest first. */
export const podcastEpisodes: PodcastEpisode[] = [
  { id: "podcast-14", title: "Goatism Ep. 19", href: "https://youtu.be/uNsMm8bWzmw", youtubeId: "uNsMm8bWzmw" },
  { id: "podcast-13", title: "Goatism Ep. 18", href: "https://youtu.be/d5FjKUItGzc", youtubeId: "d5FjKUItGzc" },
  { id: "podcast-12", title: "Goatism Ep. 17", href: "https://youtu.be/57WprAM7_mk", youtubeId: "57WprAM7_mk" },
  { id: "podcast-11", title: "Goatism Ep. 16", href: "https://youtu.be/OAPmIyjkYZ4", youtubeId: "OAPmIyjkYZ4" },
  { id: "podcast-10", title: "Goatism Ep. 15.1", href: "https://youtu.be/f2qeC12AlMg", youtubeId: "f2qeC12AlMg" },
  { id: "podcast-9", title: "Goatism Ep. 15", href: "https://youtu.be/_STZXo8QWr8", youtubeId: "_STZXo8QWr8" },
  { id: "podcast-8", title: "Goatism Ep. 14", href: "https://youtu.be/q5NsMMIlUr0", youtubeId: "q5NsMMIlUr0" },
  { id: "podcast-7", title: "Goatism Ep. 13.1", href: "https://youtu.be/C-4sEi-q0-E", youtubeId: "C-4sEi-q0-E" },
  { id: "podcast-6", title: "Goatism Ep. 13", href: "https://youtu.be/kqhsxHnwL9M", youtubeId: "kqhsxHnwL9M" },
  { id: "podcast-5", title: "Goatism Ep. 12", href: "https://youtu.be/Dq8LCczYgK0", youtubeId: "Dq8LCczYgK0" },
  { id: "podcast-4", title: "Goatism Ep. 11", href: "https://youtu.be/wX2AtZ2mnPM", youtubeId: "wX2AtZ2mnPM" },
  { id: "podcast-3", title: "Goatism Ep. 10", href: "https://youtu.be/RGjYLxOWfAc", youtubeId: "RGjYLxOWfAc" },
  { id: "podcast-2", title: "Goatism Ep. 9.1", href: "https://youtu.be/uf9wBEO25MI", youtubeId: "uf9wBEO25MI" },
  { id: "podcast-1", title: "Goatism Ep. 9", href: "https://youtu.be/Ntbqp_u2-VU", youtubeId: "Ntbqp_u2-VU" },
];
