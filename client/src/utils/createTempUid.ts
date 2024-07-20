import { v4 as uuid } from 'uuid';

export const createTempUid = () => {
  if (!localStorage.getItem('temp_uid')) {
    localStorage.setItem('temp_uid', JSON.stringify(uuid()));
  }
};
