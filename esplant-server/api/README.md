## REST API for Sensor Data

This REST API provides endpoints for managing sensor data and sensor devices. The following endpoints are available:

### Create Sensor Data

`POST /api/data`

Create a new entry of sensor data. The following fields are required in the request body:

- `sensorAddress` - the address of the sensor device
- `water` - the amount of water detected by the sensor

#### Response

- `400` - If sensorAddress and water are not provided in the request body, a `400 Bad Request` response is returned. The response body contains an error message and an empty data object.

- `500` - If the sensor device cannot be created, a `500 Internal Server Error` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor data is created successfully, a `200 OK` response is returned. The response body contains a success message and the created data object.

### Get Sensor

`GET /api/sensors/:sensorAddress`

Get details of a specific sensor device. The following path parameter is required:

- `sensorAddress` - the address of the sensor device

#### Response

- `404` - If the sensor device is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor device is found, a `200 OK` response is returned. The response body contains a success message and the sensor object.

### Get Sensors

`GET /api/sensors`

Get a list of all sensor devices.

#### Response

- `200` - If the sensor devices are found, a `200 OK` response is returned. The response body contains a success message and an array of sensor objects.

### Get Sensor Data

`GET /api/sensors/:sensorAddress/data`

Get a list of sensor data for a specific sensor device. The following path parameter is required:

- `sensorAddress` - the address of the sensor device

#### Response

- `404` - If the sensor data is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor data is found, a `200 OK` response is returned. The response body contains a success message and an array of data objects.

### Update Sensor

`PUT /api/sensors/:sensorAddress`

Update a specific sensor device. The following path parameter is required:

- `sensorAddress` - the address of the sensor device

The following fields are required in the request body:

- `name` - the new name of the sensor device

#### Response

- `404` - If the sensor device is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `400` - If the name is not provided in the request body, a `400 Bad Request` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor device is updated successfully, a `200 OK` response is returned. The response body contains a success message and the updated sensor object.

### Delete Sensor Data for Sensor

`DELETE /api/sensors/:sensorAddress/data`

Delete all sensor data for a specific sensor device. The following path parameter is required:

- `sensorAddress` - the address of the sensor device

#### Response

- `404` - If the sensor data is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor data is deleted successfully, a `200 OK` response is returned. The response body contains a success message and an empty data object.

### Delete Sensor Data by DataId

`DELETE /api/data/:dataId`

Delete a specific sensor data entry. The following path parameter is required:

- `dataId` - the id of the sensor data entry

#### Response

- `404` - If the sensor data is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor data is deleted successfully, a `200 OK` response is returned. The response body contains a success message and an empty data object.

### Delete Sensor

`DELETE /api/sensors/:sensorAddress`

Delete a specific sensor device. The following path parameter is required:

- `sensorAddress` - the address of the sensor device

#### Response

- `404` - If the sensor device is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.

- `200` - If the sensor device is deleted successfully, a `200 OK` response is returned. The response body contains a success message and an empty data object.

### Error Response

`404`

If the requested endpoint is not found, a `404 Not Found` response is returned. The response body contains an error message and an empty data object.
