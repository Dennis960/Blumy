FROM node:21 AS builder
WORKDIR /app
COPY . .
# build to /app/api/dist
RUN cd ./api && npm ci && npm run build
# build to /app/api/dashboard
RUN cd ./dashboard && npm ci && npm run build

FROM node:21
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/api .
ENV PORT=80
EXPOSE 80
USER node
CMD [ "node", "./dist/index.js" ]
