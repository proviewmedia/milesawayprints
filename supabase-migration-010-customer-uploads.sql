-- Private bucket for customer artwork uploaded on /custom ("Your artwork or
-- photo" prints). Uploads use one-time signed upload URLs from
-- /api/uploads/artwork; reads use short-lived signed URLs from the server
-- (admin email, admin order page). No public access and no RLS policies, so
-- only the service role can list or read objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-uploads',
  'customer-uploads',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/tiff', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Orders reference print_types(slug); "Your artwork" prints need a row.
-- Inactive so it never shows up as a shop category.
insert into print_types (slug, name, active, sort_order)
values ('artwork', 'Your artwork', false, 99)
on conflict (slug) do nothing;
