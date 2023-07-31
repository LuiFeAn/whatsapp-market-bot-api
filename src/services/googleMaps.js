const axios = require("axios");

class GoogleMapsService {

    api

    constructor(){

        this.api =  axios.create({
            baseUrl:`https://maps.googleapis.com/maps/api/geocode/json`,
            headers:{
                'Authorization':'AIzaSyBgfNvWwvFWG7hvaSQ7bcxqw0Itf88eYk8'
            }
        });

    }

    async getLocation(location){

        const response = await this.api.get(`/address=${location}&key=AIzaSyBgfNvWwvFWG7hvaSQ7bcxqw0Itf88eYk8`);

        console.log(response);

    }

}

module.exports = new GoogleMapsService();