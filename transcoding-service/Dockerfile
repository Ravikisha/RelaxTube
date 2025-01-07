FROM node:22

# Install FFMPEG
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Create app directory
WORKDIR /usr/src/app

# Copy app files
COPY package*.json ./
RUN npm install

COPY . .

# Expose function's port
EXPOSE 5000
CMD ["npm", "run", "dev"]
