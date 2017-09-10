const Influx = require('influx');
const moment = require('moment');


function epoch(year, month, day, hour, minute, second) {

    const result = moment(`${year}-${month}-${day}-${hour}-${minute}-${second}`, 'YYYY-M-D-H-m-s');
    return result.unix() * 1000 * 1000 * 1000;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

class Camera {

    // id
    // val

    constructor() {

        this.id = Camera.idCounter++;
        this.value = getRandomIntInclusive(0, 100);
    }

    getNextValue() {
        
        this.value += getRandomIntInclusive(-1, 1);

        this.value = this.value < 0 ? 0 : this.value;
        this.value = this.value > 100 ? 100 : this.value;

        return this.value;
    }
}

class Fixture {

    // cameras = []
    // influx

    setCameras(num) {

        this.cameras = [];
        for(let x = 0; x<num; x++) {
            this.cameras.push(new Camera());
        }
    }

    async createForHour(year, month, day, hour) {

        let points = [];

        for(var minute = 0; minute<60; minute++) {

            points = points.concat(this.cameras.map((camera) => {
                return {
                    measurement: 'uptime',
                    tags: {
                        camera: camera.id
                    },
                    fields: {
                        value: camera.getNextValue()
                    },
                    timestamp: epoch(year, month, day, hour, minute, 0)
                }
            }));
        }

        await this.influx.writePoints(points);
    }

    async connect() {

        this.influx = new Influx.InfluxDB({
            host: 'localhost',
            database: 'derp'
        });
    }

    async start() {

        await this.connect();

        for(var month=1; month<13; month++) {
            for(var day = 1; day<=28; day++) {

                for(var hour = 0; hour<24; hour++) {

                    await this.createForHour(2017, month, day, hour);
                       
                }

                console.log(`Saving 2017 ${month} ${day}`);                
            }
        }
    }   
}




async function main() {

    Camera.idCounter = 1;
    const instance = new Fixture();
    instance.setCameras(5);
    await instance.start();
}


main().then(() => {
    console.log('finished');
}, (err) => {
    console.log(err);
});