import axios from '@/axios';

export const getLevels = async () => {
  const response = await axios.get('/questions/levels');
  return response;
};