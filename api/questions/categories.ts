import axios from '@/axios';

export const getCategoriesByLevelName = async (levelName: string) => {
  const response = await axios.get('/questions/categoriesByLevelName/' + levelName);
  return response;
};