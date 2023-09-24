# ESPlant-Server

The ESPlant server is a Node.js server. It is responsible for receiving sensor data from the sensor devices and storing it in a database. It also provides an API for the ESPlant app to retrieve sensor data. Currently running at https://esplant.hoppingadventure.com.

For more information about the API, see the [REST-Api Documentation](api/README.md).

# Deployment

The deployment is made easy with a simple python script.

Just run `python deploy.py` and follow the instructions.

## Important note for development

A folder named "data" is required in the root directory of the project. This folder is used to store the database and the logs.
