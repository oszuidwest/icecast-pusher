# Use the official PHP 8.1 image as the base image
FROM php:8.2

# Install curl
RUN apt-get update && apt-get install -y curl

# Set the working directory
WORKDIR /app

# Copy the PHP script into the working directory
COPY push.php /app/push.php

# Set the entrypoint
ENTRYPOINT ["php", "push.php"]
