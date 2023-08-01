const axios = require("axios");

class GoogleMapsService {

    api

    constructor(){

        this.api =  axios.create({
            baseURL:`https://maps.googleapis.com/maps/api/geocode`,
        });

    }

    async getLocation(location){

        const uri = encodeURIComponent(location);
        
        const response = await this.api.get(`/json?address=${uri}&key=AIzaSyBgfNvWwvFWG7hvaSQ7bcxqw0Itf88eYk8`);

        const { data:{ results } } = response;

        return results[0]


    }

}

module.exports = new GoogleMapsService();