import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading, Text } from '@/components/ui/typography';
import { contactApi } from '@/lib/api';
import { fieldDescribedBy, isValidEmail } from '@/lib/forms';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

const TOPICS = [
  'Order & delivery',
  'Returns & exchanges',
  'Product & sizing',
  'Payments',
  'Something else',
];
const ORDER_TOPIC = 'Order & delivery';
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

type Field = 'name' | 'email' | 'topic' | 'message';
type Errors = Partial<Record<Field, string>>;

interface FormState {
  name: string;
  email: string;
  topic: string;
  orderNumber: string;
  message: string;
}

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Please enter your name';
  if (!form.email.trim()) errors.email = 'Please enter your email';
  else if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address';
  if (!form.topic) errors.topic = 'Please choose a topic';
  if (form.message.trim().length < MESSAGE_MIN) {
    errors.message = `Please write at least ${MESSAGE_MIN} characters`;
  }
  return errors;
}

export function ContactForm({ className }: Readonly<{ className?: string }>) {
  const user = useAuthStore((state) => state.user);
  const initial: FormState = {
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    email: user?.email ?? '',
    topic: '',
    orderNumber: '',
    message: '',
  };

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<{ name: string; email: string } | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key as Field]) setErrors(validate(next));
  };

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  };

  const errorFor = (field: Field) => (touched[field] ? errors[field] : undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setTouched({ name: true, email: true, topic: true, message: true });
    const firstInvalid = (Object.keys(found) as Field[])[0];
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(/\s+/);
      const orderLine =
        form.topic === ORDER_TOPIC && form.orderNumber.trim()
          ? `Order number: ${form.orderNumber.trim()}\n\n`
          : '';
      await contactApi.submit({
        email: form.email.trim(),
        firstName,
        lastName: rest.join(' ') || undefined,
        subject: form.topic,
        message: `${orderLine}${form.message.trim()}`,
      });
      setSentTo({ name: firstName, email: form.email.trim() });
    } catch (error: any) {
      toast.error(error.message || 'Your message could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setForm({ ...initial, name: form.name, email: form.email });
    setErrors({});
    setTouched({});
    setSentTo(null);
  };

  if (sentTo) {
    return (
      <div
        role="status"
        className={cn(
          'flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center',
          className,
        )}
      >
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <Heading as="h2" size="md">
          Thanks, {sentTo.name}! Your message is on its way.
        </Heading>
        <Text className="mt-2">
          We&apos;ll reply to <span className="font-medium text-foreground">{sentTo.email}</span> as
          soon as possible.
        </Text>
        <Button variant="outline" className="mt-8" onClick={reset}>
          Send another message
        </Button>
      </div>
    );
  }

  const messageLength = form.message.length;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('space-y-5 rounded-2xl border bg-card p-5 sm:p-8', className)}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="contact-name" label="Full name" required error={errorFor('name')}>
          <Input
            id="contact-name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => blur('name')}
            aria-invalid={!!errorFor('name')}
            aria-describedby={fieldDescribedBy('contact-name', false, !!errorFor('name'))}
            className="h-11"
          />
        </FormField>
        <FormField id="contact-email" label="Email" required error={errorFor('email')}>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => blur('email')}
            aria-invalid={!!errorFor('email')}
            aria-describedby={fieldDescribedBy('contact-email', false, !!errorFor('email'))}
            className="h-11"
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="contact-topic"
          label="What can we help with?"
          required
          error={errorFor('topic')}
        >
          <Select
            value={form.topic}
            onValueChange={(value) => {
              update('topic', value);
              setTouched((t) => ({ ...t, topic: true }));
              setErrors(validate({ ...form, topic: value }));
            }}
          >
            <SelectTrigger
              id="contact-topic"
              className="h-11 w-full"
              aria-invalid={!!errorFor('topic')}
              aria-describedby={fieldDescribedBy('contact-topic', false, !!errorFor('topic'))}
            >
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        {form.topic === ORDER_TOPIC && (
          <FormField
            id="contact-order"
            label="Order number"
            optional
            hint="Find it in your order confirmation email"
          >
            <Input
              id="contact-order"
              value={form.orderNumber}
              onChange={(e) => update('orderNumber', e.target.value)}
              aria-describedby={fieldDescribedBy('contact-order', true, false)}
              placeholder="e.g. ORD-12345"
              className="h-11"
            />
          </FormField>
        )}
      </div>

      <FormField
        id="contact-message"
        label="Message"
        required
        error={errorFor('message')}
        aside={
          <span
            className={cn(
              'text-xs tabular-nums text-muted-foreground',
              messageLength > MESSAGE_MAX * 0.9 && 'text-amber-600',
            )}
          >
            {messageLength}/{MESSAGE_MAX}
          </span>
        }
      >
        <Textarea
          id="contact-message"
          rows={6}
          maxLength={MESSAGE_MAX}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          onBlur={() => blur('message')}
          aria-invalid={!!errorFor('message')}
          aria-describedby={fieldDescribedBy('contact-message', false, !!errorFor('message'))}
          placeholder="Tell us a little about what you need…"
          className="min-h-36 resize-y"
        />
      </FormField>

      <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-accent-rose">*</span> are required.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 gap-2 bg-accent-rose px-6 hover:bg-accent-rose-dark"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
