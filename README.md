# Adwisar Adapter

Receive the sensor data from Kerlink and send them to Adwisar.

## Dependencies

## Usage

The first step is to clone this repo.
The service can then be run either using `npm` or `docker`.

### With NPM

This was tested using Node LTS (8.11.3) and npm@6.3.0

For production mode:

    # from the project root folder
    npm install --production
    npm start

For development:

    # from the project root folder
    npm install
    npm run dev

### With docker

    # from the project root folder
    # This will run the tests and build the project in production mode
    docker build -t adwisar-adapter
    # This will start the project on port 3000 by default
    docker run adwisar-adapter

### Environment

The app can be configured using the environment.
The following variables are accepted:

- `ADWISAR_ENDPOINT` (required): the URL of the ADWISAR instance.
- `PANEL1_DEV_EUI` (default: 4883c7df30051526): The EUI of the device placed at Panel1
- `PANEL2_DEV_EUI` (default: 4883c7df3005179e): The EUI of the device placed at Panel2
- `CAP1_DEV_EUI` (default: 4883c7df3005148c): The EUI of the device placed at Cap1
- `HOST` (default: 0.0.0.0): The host the http server will listen to.
- `PORT` (default: 3000): The port the http server will bind to.
- `LOG_LEVEL` (default: info, devDefault: debug): The log level, must be one of debug, info, warn, error or silent.
