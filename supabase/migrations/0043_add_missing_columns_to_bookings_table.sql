ALTER TABLE public.bookings
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN repeat_type public.repeat_type_enum DEFAULT 'no_repeat',
ADD COLUMN repeat_end_date DATE,
ADD COLUMN parent_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
ADD COLUMN status TEXT DEFAULT 'confirmed';