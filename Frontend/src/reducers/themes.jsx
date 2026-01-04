import {


}from '../actions/types'


const date = new Date()
const initialState = {
    components : {
        light_theme : 'lemonade',
        dark_theme : 'synthwave' , 
    }

};
//console.log(min)
// the function bellow can be imported from any file using any name since we have exported it as default and we have not assigned a name to it

export default function (state = initialState, action) {

  
    const { type, payload} = action;
       
    switch (type) {
       
        default:
            return state
    }

   
}