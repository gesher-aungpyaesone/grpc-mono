npx prisma generate --schema=databases/auth/schema.prisma
npx prisma migrate dev --schema=databases/auth/schema.prisma

cd protos
sh build.sh

yarn lint
yarn format


yarn
nest start --watch
nest start auth -- watch