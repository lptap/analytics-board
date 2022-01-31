FROM nginx:alpine
EXPOSE 80
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
RUN mkdir -p /usr/share/nginx/html/static-files
RUN chown -R nginx:nginx /usr/share/nginx/html/static-files
