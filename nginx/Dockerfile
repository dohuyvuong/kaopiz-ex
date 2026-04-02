FROM nginx:alpine

# Install certbot with webroot plugin
RUN apk add --no-cache certbot

# Remove default nginx conf (our entrypoint generates it dynamically)
RUN rm -f /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
