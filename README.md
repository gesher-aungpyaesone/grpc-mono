# Auth MS
## Create migrate file
```
npx prisma migrate dev --schema=databases/auth/schema.prisma
```

## Reset DB
```
npx prisma migrate reset --force --schema=databases/auth/schema.prisma
```

## Run seed
```
node databases/auth/seed.ts
```

# Ads Gen MS
## Create migrate file
```
npx prisma migrate dev --schema=databases/ads-gen/schema.prisma
```

## Reset DB
```
npx prisma migrate reset --force --schema=databases/ads-gen/schema.prisma
```


# Development
## Install packages
```
yarn
```

## Format
```
yarn lint
yarn format
```

## Generate Proto TS
```
cd protos
sh build.sh
```

## Start MS
```
# start api gateway
npx prisma migrate deploy --schema=databases/auth/schema.prisma
nest start --watch

# start auth ms
npx prisma generate --schema=databases/auth/schema.prisma
nest start auth -- watch

# start ads-gen ms
npx prisma generate --schema=databases/ads-gen/schema.prisma
nest start ads-gen -- watch
```