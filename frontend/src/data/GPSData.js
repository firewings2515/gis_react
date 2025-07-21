export class GPSJson {
    constructor(jsonData) {
        this.data = [];
        const gpsArray = jsonData.gpsData;
        for (let i = 0; i < gpsArray.length; i++) {
            const element = gpsArray[i];
            this.data.push(
                GPSData(element));
        }
    }
}

export default class GPSData {
    constructor(gpsjson) {
        this.timestamp = gpsjson.timestamp;
        this.imageName = gpsjson.imageName;
        // array [lng, lat]
        this.lnglat = [gpsjson.lng, gpsjson.lat];
        // array [x, y]
        this.twd97 = [gpsjson.x, gpsjson.y];
        this.height = gpsjson.height;
        this.h2 = gpsjson.h2;
        // array [yaw, pitch, roll]
        this.rotation = [gpsjson.yaw, gpsjson.pitch, gpsjson.roll];
        this.float_value = gpsjson.float_value;
    }
}