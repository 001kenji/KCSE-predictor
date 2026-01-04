import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import '../App.css'
import { useNavigate, useParams } from 'react-router-dom';
import { connect, useDispatch } from "react-redux";
import {useSelector} from 'react-redux'
import { IoMdAdd } from "react-icons/io";
import { IoSunny } from "react-icons/io5";
import { BsMoonStarsFill } from "react-icons/bs";
import { TiThMenuOutline } from "react-icons/ti";
import { CheckAuthenticated, logout,FetchLogout, load_user,GetCSRFToken } from "../actions/auth";
import TrainingWorkflow from "./train.jsx";
import { PageToogleReducer, ToogleTheme } from "../actions/types.jsx";
import AIPredictionPage from './AIPage.jsx'
import DashboardPage from "./dashboard.jsx";
import Notifier from "../Components/notifier.jsx";
import DefaultImg from '../assets/images/fallback.png'
import Pricing from "./ContactMe.jsx";
import { RealoadUserAuthReducer } from "../actions/types.jsx";
const Home = ({}) => {
    const { page, extrainfo } = useParams();
    const dispatch = useDispatch()
    const UserRefreshToken = useSelector((state) => state.auth.refresh)
    const RealoadUserAuth = useSelector((state) => state.auth.RealoadUserAuth)
    const navigate = useNavigate();
    const [Theme,SetTheme] = useState(useSelector((state)=> state.auth.Theme))
    const [Page,SetPage] = useState('dashboard')
    const SideNavControler = useRef(null)
    const SelectedPage = useSelector((state) => state.auth.Page)
    const ComponentsColors = useSelector((state) => state.themes.components)
    const User = useSelector((state)=> state.auth.user)
    const Email = User != null ? User.email : 'gestuser@gmail.com'
    const UserID = User != null ? User.id : import.meta.env.VITE_GEST_USER // this is the id for gest user
    
    const [Profile,SetProfile] = useState({
        'name' : User != null ? User.name : '',
        'email' : Email,
        'ProfilePic' : User != null ? User.ProfilePic : DefaultImg,
        'ProfilePicName' : User != null ? User.ProfilePic : 'Profile Picture',
    })
    

    useEffect(() => {
        if(User != null) {
            SetProfile((e) => {
                return {
                    ...e,
                    'ProfilePic' : User.ProfilePic
                }
            })
            dispatch({
                type : ShowLoginContainerReducer,
                payload : false
            })
            
            
        }else {
            SetProfile((e) => {
                return {
                    ...e,
                    'ProfilePic' : `${import.meta.env.VITE_APP_API_URL}/media/media unavailable ${Theme}.jpg`
                }
            })
           
        }
    },[User])

    useLayoutEffect(() => {
        var storeTheme = localStorage.getItem('theme')
        if(page != null){
            // TooglePages(page)
            SetPage(page)
            navigate(`/home/${page}`)
        }
        var storage_theme = localStorage.getItem("data-theme")
        FuncToogleTheme(storage_theme)

        if(storeTheme == 'dark' || storeTheme == 'light'){
            dispatch({
                type : ToogleTheme,
                payload : storeTheme
            })
            SetTheme(storeTheme)
           
        }
    },[])

    useLayoutEffect(() => {
        var local_access = String(localStorage.getItem('access'))
        // console.log(local_access)
        // console.log('triggered')
        GetCSRFToken()
        // console.log(UserRefreshToken,local_access)
        if(UserRefreshToken || RealoadUserAuth == true || (local_access != 'undefined' && local_access != '' && local_access != 'null' && local_access)){
            // console.log('loading')
            var toastid = null
            CheckAuthenticated();
            load_user(toastid,false);
            
            dispatch({
                type : RealoadUserAuthReducer,
                payload : false
            })
        }
        
    },[UserRefreshToken,RealoadUserAuth])
   
 

    function FuncToogleTheme (props) {
        if(props){
            
            var props_value = props == ComponentsColors.light_theme ? 'light' : 'dark'
        }else {
             var props_value = Theme == 'light' ? 'dark' : 'light'
        }
        SetTheme(props_value)
        dispatch({
            type : ToogleTheme,
            payload : props_value
        })
        localStorage.setItem('theme',props_value)
        var state_theme = props_value == 'light' ? ComponentsColors.light_theme : ComponentsColors.dark_theme
        localStorage.setItem("data-theme", state_theme)
        document.documentElement.setAttribute("data-theme", state_theme)
        
    }

    function TooglePages (props){
        dispatch({
            type : PageToogleReducer,
            payload : props
        })
        if (props != null && props == 'AI') {
            SetPage(props)
            navigate(`/home/${props}`)
        }else if (props != null && props == 'ContactMe'){
            SetPage(props)
            navigate(`/home/${props}`)
        }else if (props != null && props == 'dashboard'){
            SetPage(props)
            navigate(`/home/${props}`)
        }else if (props != null ){
            SetPage(props)
            navigate(`/home/${props}`)
        }
       
        if(SideNavControler.current != null){
            SideNavControler.current.click()
        }
        
       
    }

    return (
        <div className={`w-full drawer ${Theme} lg:drawer-open  max-w-full overflow-x-hidden md:h-screen h-full relative  selection:bg-black selection:text-white selection:font-bold selection:p-1 dark:selection:bg-white  dark:selection:text-black `} >
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle " />
                <div className={` drawer-content  relative overflow-auto h-full overflow-x-hidden min-h-screen  flex flex-col `}>
                    <div className="w-full pb-10   max-w-screen overflow-hidden mx-auto h-fit relative">
                        <div className="navbar fixed w-[96%] md:w-[98%] lg:w-[calc(99%-260px)] lg:left-[260px] top-2 inset-x-2 rounded-2xl shadow-xs shadow-slate-400 dark:shadow-slate-500 backdrop-blur-sm z-50 transition-all duration-300  ">
                            <div className="flex-none pl-2 lg:hidden">
                            <label
                                htmlFor="my-drawer-3"
                                aria-label="open sidebar"
                                className="btn btn-square btn-ghost hover:bg-transparent border-none hover:shadow-xs hover:shadow-slate-400 dark:hover:shadow-slate-100"
                            >
                                <TiThMenuOutline className="inline-block h-5 w-5 text-slate-700 dark:text-slate-300 stroke-current" />
                            </label>
                            </div>
                            <div
                                id="BigProppin"
                                className="mx-2 font-sans md:hidden flex-1 text-transparent bg-clip-text bg-gradient-to-br from-rose-700 dark:from-rose-600 to-amber-400 dark:to-amber-400 w-fit max-w-fit text-lg md:text-xl lg:text-2xl px-2"
                                >
                                {import.meta.env.VITE_APP_NAME}
                            </div>
                            <div
                                id="BigProppin"
                                className=" font-sans hidden md:flex flex-1 text-transparent bg-clip-text bg-gradient-to-br from-rose-700 dark:from-rose-600 to-amber-400 dark:to-amber-400 w-fit mx-auto max-w-fit text-lg md:text-xl lg:text-2xl px-2"
                                >
                                {import.meta.env.VITE_APP_FULL_NAME}
                            </div>
                        </div>
                    </div>

                    {/* Page content here */}
                    <div className={`  flex  z-40  overflow-x-hidden justify-center relative  h-full w-full min-w-full `} >
                         <Notifier />
                        {    
                        Page == 'dashboard' ? 
                        <DashboardPage className='z-30' />
                        :                  
                        Page == 'AI' ? 
                            <AIPredictionPage className='z-30' />                      
                        :
                        Page == 'Train' ? 
                            <TrainingWorkflow className='z-30' />                      
                        :
                        Page == 'ContactMe' ? 
                            <Pricing className='z-30' />
                             :
                            ''
                        }
                    </div>

                </div>
                <div className="drawer-side z-50 lg:drawer-close ">
                    <label  htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay transition-all duration-500"></label>
                    <ul className={` menu bg-transparent gap-2  backdrop-blur-sm lg:backdrop-blur-none rounded-2xl lg:rounded-none  lg:bg-transparent my-auto mx-auto sm:ml-1 lg:dark:bg-transparent  border-r-[1px] lg:max-w-[250px]  border-r-slate-500 dark:border-r-slate-600 min-h-[98%] lg:min-h-full  font-[PoppinsN] shadow-slate-600/55 dark:shadow-slate-200/20 shadow-xs  transition-all duration-500 w-[97%] sm:w-80 p-4 `}>
                        <label ref={SideNavControler} htmlFor="my-drawer-3" aria-label="open sidebar" className="btn lg:invisible btn-square btn-ghost bg-transparent border-none hover:shadow-xs hover:shadow-slate-500 dark:hover:shadow-slate-50">
                            <IoMdAdd  
                                className="inline-block rotate-45 transition-all duration-300 ml-auto h-5 w-full hover:text-rose-600 text-slate-900 dark:text-slate-300 stroke-current"
                            />                            
                        </label>
                        {/* Sidebar content here */}
                        <li onClick={()=> TooglePages('dashboard')} className= {` ${Page == 'dashboard' ? ' text-sky-600 dark:text-amber-500' : ''} bg-slate-100/50 dark:bg-slate-800/50 lg:bg-transparent lg:dark:bg-transparent rounded-md hover:pl-6  transition-all hover:text-secondary dark:hover:text-slate-50  duration-300 cursor-pointer `} ><a className=" cursor-pointer" >Dashboard</a></li>
                        <li onClick={()=> TooglePages('AI')} className= {` ${Page == 'AI' ? ' text-sky-600 dark:text-amber-500' : ''} bg-slate-100/50 dark:bg-slate-800/50 lg:bg-transparent lg:dark:bg-transparent rounded-md hover:pl-6  transition-all  hover:text-secondary dark:hover:text-slate-50  duration-300 cursor-pointer `} ><a className="cursor-pointer " >AI</a></li>
                        <li onClick={()=> TooglePages('Train')} className= {` ${Page == 'Train' ? ' text-sky-600 dark:text-amber-500' : ''} bg-slate-100/50 dark:bg-slate-800/50 lg:bg-transparent lg:dark:bg-transparent rounded-md hover:pl-6  transition-all  hover:text-secondary dark:hover:text-slate-50  duration-300 cursor-pointer `} ><a className="cursor-pointer " >Train</a></li>
                        <li onClick={()=> TooglePages('ContactMe')} className= {` ${Page == 'ContactMe' ? ' text-sky-600 dark:text-amber-500' : ''}bg-slate-100/50 dark:bg-slate-800/50 lg:bg-transparent lg:dark:bg-transparent rounded-md  hover:pl-6  transition-all  hover:text-secondary dark:hover:text-slate-50  duration-300 cursor-pointer `} ><a className="cursor-pointer" >Contact Me</a></li>
                        
                        <li  className=" hover:pl-6 bg-slate-100/50 dark:bg-slate-800/50 lg:bg-transparent lg:dark:bg-transparent rounded-md group transition-all  hover:text-secondary dark:hover:text-slate-50 duration-300" >
                            <a onClick={()=>FuncToogleTheme(null)} className="cursor-pointer overflow-hidden"  >Theme {Theme == 'dark' ? 
                                <BsMoonStarsFill   className=" text-base animate-nonne duration-700 text-sky-300 cursor-pointer group-hover:animate-pulse" /> : 
                                <IoSunny  className=" text-lg animate-pulse duration-700 text-yellow-400 cursor-pointer group-hover:animate-spin " /> } 
                            </a> 
                        </li>
                      

                    </ul>
                </div>
        </div>
    )
   
};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated,
    
})    
export default connect(mapStateToProps, {CheckAuthenticated,logout,FetchLogout,load_user,GetCSRFToken})(Home)
