import axios from 'axios';
import { anilistQuery } from '../constants';
import { getSeriesId } from '../helpers';

const komgaApiUrl = `${window.location.origin}/api/v1`;

export const updateMetadata = (data) => axios({
  method: 'patch',
  url: `${komgaApiUrl}/series/${getSeriesId()}/metadata`,
  data,
});

export const searchAnlist = (search) => (
  axios({
    method: 'post',
    url: 'https://graphql.anilist.co',
    data: {
      query: anilistQuery,
      variables: {
        search,
        page: 1,
        perPage: 30,
        type: 'MANGA',
      },
    },
  })
);

export const getExistingMetadata = () => (axios({
  method: 'get',
  url: `${komgaApiUrl}/series/${getSeriesId()}`,
}));

export const uploadCover = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios({
    method: 'post',
    url: `${komgaApiUrl}/series/${getSeriesId()}/thumbnails`,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
  });
};

export const downloadBangumiCover = async (url) => {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
    method: 'get',
  });
  return response.blob();
};

export const searchBangumi = (search) => (axios({
  method: 'post',
  url: 'https://api.bgm.tv/v0/search/subjects?limit=10',
  data: {
    keyword: search,
    filter: {
      type: [1],
      rating: ['>0.0'],
      rank: ['>=0'],
      series: true,
      nsfw: true,
    },
  },
}));

export const searchKitsu = (search) => (axios({
  method: 'get',
  url: `https://kitsu.io/api/edge/manga?filter[text]=${search}&page[limit]=10`,
}));

export const searchMAL = (search) => (axios({
  method: 'get',
  url: `https://api.jikan.moe/v3/search/manga?q=${search}&page=1`,
}));

export const getKitsuGenres = (id) => (axios({
  method: 'get',
  url: `https://kitsu.io/api/edge/manga/${id}/genres`,
}));

export const getMALInfo = (id) => (axios({
  method: 'get',
  url: `https://api.jikan.moe/v3/manga/${id}`,
}));
