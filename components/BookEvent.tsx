'use client';

import { createBooking } from '@/lib/actions/booking.actions';
import posthog from 'posthog-js';
import { useState } from 'react';

export const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success } = await createBooking({ eventId, slug, email });

    if (success) {
      setSubmitted(true);
      posthog.capture('event_booked', { eventId, slug, email });
    } else {
      console.error('Booking failed');
      posthog.captureException('Booking creation failed', { eventId, slug, email });
    }
  };
  return (
    <div id='book-event'>
      {submitted ? (
        <p className='text-sm'>Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email'>Email Address</label>
            <input
              type='email'
              name='email'
              id='email'
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              placeholder='Enter your email address'
            />
          </div>
        </form>
      )}
    </div>
  );
};
