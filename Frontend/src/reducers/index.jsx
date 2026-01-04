import {combineReducers} from 'redux'
import auth from './auth'
import themes from './themes'
//combineReduxers creates a single object called 'rootReducer'
export default combineReducers({
    auth,
    themes
});