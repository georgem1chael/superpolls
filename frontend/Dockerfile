# First stage: build
FROM node:trixie AS build

COPY . .

RUN ["npm", "install"]
RUN ["npm", "run", "build"]

FROM nginx:trixie AS server

COPY --from=build ./dist /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
