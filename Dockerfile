#
# $Id: Dockerfile 47671 2019-04-11 09:09:24Z svnmir $
#

#
# build stage
#
FROM node:10 AS build

#
# cache node modules
#
ADD package.json /tmp/package.json
ADD lib /tmp/lib
RUN cd /tmp && npm install --no-audit
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app
ADD . /app

RUN npm run build


#
# execution stage
#
FROM nginx:latest
COPY --from=build /app/www /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf
