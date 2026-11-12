This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Collab runs as three repos side by side: this one, `../collab-realtime` and `../collab-api/collab-api`.
One command starts everything (web, realtime, API and the LiveKit server for calls), with each
service's output labelled. Ctrl+C stops them all:

```bash
npm run dev                       # API uses its .env (Supabase)
npm run dev -- --local            # API uses the in-memory "local" profile instead
npm run dev -- --no-livekit       # skip a service: --no-web, --no-realtime, --no-api, --no-livekit
npm run dev:web                   # only this Next.js app
```

The API needs Java 25; the script finds it in `~/.jdks` (or uses `JAVA_HOME` if it points at a JDK 25).
For calls, download the LiveKit server first (see `../collab-realtime/livekit/README.md`).

> ⚠️ **Git hooks:** This repo installs Git hooks via Husky. After cloning, run `npm install` (which runs `prepare`) to set up hooks.
>
> The repository includes `post-merge` and `post-checkout` hooks that automatically run `npm install --legacy-peer-deps` when you perform `git pull` or `git switch`, ensuring dependencies (including legacy peer deps) are installed.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
