# Interview Repo

This is a repository for the starting code of the interview project.

## How to run the project

1. Run `npm install`
2. Run `docker-compose up`
3. Run `npx prisma migrate dev` for initial migrations
4. Run `bun run prisma:seed` for seeding the database. Here I'm using bun but you can use node if you have it configured to run ts files.

Read the TODO.md file for the project requirements.