# Define from what image we want to build our own image from.
FROM node:lts

# Create the working directory that holds the application code inside our image.
RUN mkdir /app
WORKDIR /app

# Install app dependencies inside our image.
COPY package.json /app
RUN npm install

# Bundle app source
ADD src /app/src
ADD dist /app/dist
ADD resetPassword /app/resetPassword
# Bind app to the specified port to be mapped by the Docker daemon.
EXPOSE 8080

# Define environment variables
# ENV SESSION_SECRET
# ENV AUTH_SECRET
# ENV PG_USERNAME
# ENV PG_HOSTNAME
# ENV PG_PORT
# ENV PG_DB_NAME


# Define the command to run app.
CMD ["npm", "start"]
