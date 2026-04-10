# Use the official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose the port your app uses (Back4app needs to know this)
EXPOSE 3000

# Command to start your application
CMD ["npm", "start"]
