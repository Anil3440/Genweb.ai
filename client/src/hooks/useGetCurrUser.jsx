import React, { useEffect,} from 'react'
import {useDispatch} from 'react-redux'
import {serverUrl} from '../App';
import axios from 'axios';
import { setAuthLoading, setUserData } from '../redux/userSlice';

function useGetCurrUser() {
  const dispatch = useDispatch();
  useEffect(()=>{
    const getCurrUser = async() =>{
      try{
        const result = await axios.get(`${serverUrl}/api/user/profile`,{withCredentials: true});
        dispatch(setUserData(result.data))
      }catch(error){
        console.log(error);
        dispatch(setUserData(null));
      } finally {
        dispatch(setAuthLoading(false));
      }
    }
    getCurrUser();
  },[dispatch])
}

export default useGetCurrUser
