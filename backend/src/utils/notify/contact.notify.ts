import type { Contact, CreateContactParams } from '@afrisinc/notify-sdk';
import { notify } from './notify';

export const createContact = async (params: CreateContactParams): Promise<Contact> => {
  if (!notify) {
    throw new Error('Notify is not configured');
  }

  return notify.contacts.create(params);
};
