# Use Node.js with Python support
FROM node:18-bullseye

# Install Python & pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy Node dependencies
COPY package*.json ./
RUN npm install

# Copy Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 8080

# Start Node server
CMD ["node", "server.js"]
