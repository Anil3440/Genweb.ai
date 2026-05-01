import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App';
import { useEffect } from 'react';

const LiveSite = () => {
    const {slug} = useParams();
    const[html,setHtml] = useState("");
    const [error,setError] = useState("");

    useEffect(() => {
    const handleGetWebsite = async () => {
        try {
        const res = await axios.get(
            `${serverUrl}/api/website/get-by-slug/${slug}`,
        );
        setHtml(res.data.latestCode)
        } catch (error) {
        console.log(`error fetching website ${error}`);
        setError(error?.response?.data?.message || "Site not found");
        }
    };
    handleGetWebsite();
    }, [slug]);

    if (error) {
      return (
        <div className='h-screen flex items-center justify-center bg-black text-white'>
            {error}
        </div>
      );
    }

  return (
    <div>
      <iframe title='Live Site' srcDoc={html} className='w-screen h-screen border-none' sandbox='allow-scripts allow-same-origin allow-forms'/>
    </div>
  )
}

export default LiveSite
