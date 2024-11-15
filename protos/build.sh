# npx protoc --plugin=$(npm root)/.bin/protoc-gen-ts_proto \
#  --ts_proto_out=dist \
#  --ts_proto_opt=outputServices=grpc-js \
#  --ts_proto_opt=esModuleInterop=true \
#  --proto_path=$(pwd)/protos \
#  $(pwd)/protos/*.proto

npx protoc --plugin=$(npm root)/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$(pwd)/dist \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=snakeToCamel=false \
  --proto_path=$(pwd) \
 $(pwd)/*.proto