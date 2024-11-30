import xss from 'xss';
import he from 'he';
import * as CONSTANTS from './constants';

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
};

const match = (pattern, item) => {
  const regex = new RegExp(`.*${pattern}.*`, 'i');
  return regex.test(item);
};

export const getText = (text) => {
  let result = text.replace(/<br>/gi, '\n');
  result = he.unescape(result);
  result = xss(result, {
    whiteList: [], // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ['script'], // the script tag is a special case, we need to filter out its content
  });
  return result;
};

export const getBangumiSeriesMatch = (search, list) => {
  let series;
  for (let i = 0, len = list.length; i < len; i += 1) {
    const item = list[i];

    // Check titles & If found in titles then return
    if (
      match(search, item.name)
      || match(search, item.name_cn)
    ) {
      series = item;
      break;
    }
    // Check synonyms
    for (let y = 0, synLen = item.synonyms.length; y < synLen; y += 1) {
      const syn = item.synonyms[y];
      if (match(search, syn)) {
        series = item;
        break;
      }
    }
    // If broke out of synonyms and found it end
    if (series) {
      break;
    }
  }
  if (!series) {
    // console.log('never found');
    [series] = list;
  }
  console.log('series', series);
  return series;
};

export const getSeriesMatch = (search, list) => {
  let series;
  for (let i = 0, len = list.length; i < len; i += 1) {
    const item = list[i];

    // Check titles & If found in titles then return
    if (
      match(search, item.title.english)
      || match(search, item.title.romaji)
      || match(search, item.title.native)
    ) {
      series = item;
      break;
    }
    // Check synonyms
    for (let y = 0, synLen = item.synonyms.length; y < synLen; y += 1) {
      const syn = item.synonyms[y];
      if (match(search, syn)) {
        series = item;
        break;
      }
    }
    // If broke out of synonyms and found it end
    if (series) {
      break;
    }
  }
  if (!series) {
    // console.log('never found');
    [series] = list;
  }
  return series;
};

export const getStatus = (input = '') => {
  let status = input;
  switch (input.toUpperCase()) {
    case 'FINISHED': // AL, Kitsu && MAL
      status = 'ENDED';
      break;
    case 'RELEASING': // AL
    case 'CURRENT': // Kitsu
    case 'PUBLISHING': // MAL
      status = 'ONGOING';
      break;
    case 'ABANDONED':
    case 'DISCONTINUED': // MAL
      // Not supported by AL & Kitsu
      status = 'ABANDONED';
      break;
    case 'HIATUS':
    case 'ON HIATUS': // MAL
      // Not supported by AL & Kitsu
      status = 'HIATUS';
      break;
    default:
      status = 'ONGOING'; // Kitsu has some weird status values, seems like it's a text field from their side.
      break;
  }
  return status;
};

const getKitsuAgeRating = (input) => {
  let ageRating = input;

  if (ageRating) {
    switch (input.toUpperCase()) {
      case 'G':
        ageRating = 0;
        break;
      case 'PG':
      case 'PG-13':
        ageRating = 13;
        break;
      case 'R':
        ageRating = 18;
        break;
      default:
        ageRating = undefined;
        break;
    }
  }
  return ageRating;
};

const uniqueLinks = (links) => {
  const map = links
    .filter((l) => l)
    .reduce((acc, cur) => {
      const { label } = cur;
      return acc.has(cur.label) ? acc : acc.set(label, cur);
    }, new Map())
    .values();
  return [...map];
};

export const getDefaultValues = (data) => {
  const { selectedSeries = {}, existingMetadata = {} } = (data || {});
  let tags = existingMetadata.tags || [];
  let {
    authors, publisher, language, status, genres, ageRating, summary, links,
  } = existingMetadata;

  if (!window.komga.enforceLocks) {
    // Tags Logic
    if (!(existingMetadata.tagsLock && window.komga.enforceLocks)) {
      tags = [...new Set([...(existingMetadata.tags || []), ...(selectedSeries.tags || [])])];
    }

    // Genres Logic
    if (!(existingMetadata.genresLock && window.komga.enforceLocks)) {
      genres = [...new Set([...(existingMetadata.genres || []), ...(selectedSeries.genres || [])])];
    }

    // Status Logic
    if (!(existingMetadata.statusLock && window.komga.enforceLocks)) {
      status = getStatus(selectedSeries.status || existingMetadata.status);
    }

    // ageRating Logic
    if (!(existingMetadata.ageRatingLock && window.komga.enforceLocks)) {
      ageRating = selectedSeries?.ageRating;
    }

    // publisher Logic
    if (!(existingMetadata.publisherLock && window.komga.enforceLocks)) {
      publisher = selectedSeries?.publisher || existingMetadata.publisher;
    }

    // language Logic
    if (!(existingMetadata.languageLock && window.komga.enforceLocks)) {
      language = window.komga.defaultLanguage;
    }

    if (!(existingMetadata.summaryLock && window.komga.enforceLocks)) {
      summary = selectedSeries.description || selectedSeries.summary || existingMetadata.summary;
    }

    if (!(existingMetadata.authorsLock && window.komga.enforceLocks)) {
      authors = selectedSeries.authors || existingMetadata.authors;
    }

    if (!(existingMetadata.linksLock && window.komga.enforceLocks)) {
      links = uniqueLinks([...existingMetadata.links, ...selectedSeries.links]);
    }
  }

  const defaultValues = {
    title: existingMetadata.title,
    sortTitle: existingMetadata.titleSort,
    alternativeTitles: selectedSeries.alternativeTitles,
    coverImage: selectedSeries.coverImage,
    coverToggle: selectedSeries.coverToggle,
    links,
    authors,
    summary: getText(summary),
    status,
    publisher,
    genres,
    tags,
    language,
    ageRating,
  };
  return defaultValues;
};

export const mapAnilistSearch = (alList) => alList.map((series) => ({
  ...series,
  tags: (series?.tags || []).map((tag) => tag?.name),
  source: CONSTANTS.AL,
}));

const getBangumiAuthors = (infobox) => {
  const AUTHOR_ROLES = ['WRITER'];
  const ARTIST_ROLES = ['PENCILLER', 'INKER', 'COLORIST', 'LETTERER', 'COVER'];

  const author = infobox?.['作者'];
  const creator = infobox?.['原作'];
  const artist = infobox?.['作画'];
  const character = infobox?.['人物原案'];

  const authors = [];

  const addRoles = (name, roles) => {
    roles.forEach(((role) => {
      authors.push({ name, role });
    }));
  };

  if (author) {
    addRoles(author, [...AUTHOR_ROLES, ...ARTIST_ROLES]);
  }
  if (creator) {
    addRoles(creator, AUTHOR_ROLES);
  }
  if (artist) {
    addRoles(artist, ARTIST_ROLES);
  }
  if (character) {
    addRoles(character, ARTIST_ROLES);
  }

  return authors;
};

export const mapBangumiSearch = (bangumiList) => bangumiList.map((series) => {
  const infobox = series?.infobox?.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  const endDateRaw = infobox?.['结束'] || null;
  const status = endDateRaw ? 'ENDED' : 'ONGOING';

  return {
    id: series.id,
    title: {
      native: series.name,
      chinese: series.name_cn,
    },
    alternativeTitles: [...(infobox?.['别名'] || []).filter(({ k }) => !!k).map(({ k, v }) => ({ label: k, title: v }))],
    authors: getBangumiAuthors(infobox),
    description: series.summary,
    status,
    coverImage: {
      extraLarge: series?.images?.large,
      large: series?.images?.medium,
      medium: series?.images?.common,
      small: series?.images?.small,
    },
    genres: [],
    synonyms: [...(infobox?.['别名'] || []).map((name) => name.v)],
    tags: (series?.tags || []).slice(0, 15).filter((tag) => tag.count > 1).map((tag) => tag?.name),
    publisher: infobox?.['出版社'],
    source: CONSTANTS.BANGUMI,
    readingDirection: 'RIGHT_TO_LEFT',
    language: 'zh',
    links: [
      {
        label: 'Bangumi',
        url: `https://bangumi.tv/subject/${series.id}`,
      },
    ],
    siteUrl: xss(`https://bangumi.tv/subject/${series.id}`, {
      whiteList: [], // empty, means filter out all tags
      stripIgnoreTag: true, // filter out all HTML not in the whitelist
      stripIgnoreTagBody: ['script'], // the script tag is a special case, we need to filter out its content
    }),
  };
});

export const mapKitsuSearch = (kitsuList) => kitsuList.map((series) => ({
  id: series.id,
  title: {
    romaji: series?.attributes?.titles?.en_jp,
    english: series?.attributes?.titles?.en || series?.attributes?.titles?.en_us,
    native: series?.attributes?.titles?.ja_jp,
  },
  description: series?.attributes?.description || series?.attributes?.synopsis,
  status: series?.attributes?.status,
  coverImage: {
    extraLarge: series?.attributes?.posterImage?.original,
    large: series?.attributes?.posterImage?.large,
    medium: series?.attributes?.posterImage?.medium,
    small: series?.attributes?.posterImage?.small,
  },
  genres: [],
  synonyms: [...(series?.attributes?.abbreviatedTitles || []), ...[series?.attributes?.canonicalTitle || '']],
  tags: [],
  ageRating: getKitsuAgeRating(series?.attributes?.ageRating),
  publisher: undefined,
  source: CONSTANTS.KITSU,
  siteUrl: xss(`https://kitsu.io/manga/${series?.attributes?.slug || series?.id || ''}`, {
    whiteList: [], // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ['script'], // the script tag is a special case, we need to filter out its content
  }),
}));

export const mapMALSearch = (malList) => malList.map((series) => ({
  id: series?.mal_id,
  title: {
    romaji: undefined,
    english: series?.title,
    native: undefined,
  },
  description: series?.synopsis,
  status: undefined,
  coverImage: {
    extraLarge: undefined,
    large: series?.image_url,
    medium: undefined,
    small: undefined,
  },
  genres: [],
  synonyms: [],
  tags: [],
  ageRating: undefined,
  publisher: undefined,
  source: CONSTANTS.MAL,
  siteUrl: xss(series?.url || '', {
    whiteList: [], // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ['script'], // the script tag is a special case, we need to filter out its content
  }),
}));

export const getSeriesId = () => {
  const pathNameArray = window.location.pathname.split('/') || [''];
  let seriesId = pathNameArray.pop();
  if (seriesId === '') {
    seriesId = pathNameArray.pop();
  }
  return seriesId;
};
