This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


//rls

alter table mahasiswa enable row level security;

drop policy if exists "Allow public select mahasiswa" on mahasiswa;
drop policy if exists "Allow public insert mahasiswa" on mahasiswa;
drop policy if exists "Allow public update mahasiswa" on mahasiswa;
drop policy if exists "Allow public delete mahasiswa" on mahasiswa;

create policy "Allow public select mahasiswa"
on mahasiswa
for select
to anon
using (true);

create policy "Allow public insert mahasiswa"
on mahasiswa
for insert
to anon
with check (true);

create policy "Allow public update mahasiswa"
on mahasiswa
for update
to anon
using (true)
with check (true);

create policy "Allow public delete mahasiswa"
on mahasiswa
for delete
to anon
using (true);