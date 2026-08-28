import { createContact } from '../utils/notify/contact.notify';

interface SubmitContactFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subject: string;
  message: string;
}

export class ContactService {
  static async submitContactForm(data: SubmitContactFormData) {
    return createContact({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      subject: data.subject,
      message: data.message,
      source: 'contact_form',
    });
  }

  static async subscribeNewsletter(email: string) {
    return createContact({
      email,
      source: 'newsletter',
      subscribed: true,
      tags: ['newsletter'],
    });
  }

  static async unsubscribeNewsletter(email: string) {
    return createContact({
      email,
      source: 'newsletter',
      subscribed: false,
    });
  }
}
