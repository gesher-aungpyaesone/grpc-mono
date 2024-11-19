## Create migrate file
```
npx prisma migrate dev --schema=databases/auth/schema.prisma
```

## Reset DB
```
npx prisma migrate reset --force --schema=databases/auth/schema.prisma
```

## Format
```
yarn lint
yarn format
```

## Setup
```
yarn
npx prisma migrate deploy --schema=databases/auth/schema.prisma
npx prisma generate --schema=databases/auth/schema.prisma

cd protos
sh build.sh
cd ..

nest start --watch
nest start auth -- watch
```