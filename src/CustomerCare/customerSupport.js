import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
import Body from './body';
import UserHeader from '../UserManagement/components/UserHeader';

function CustomerSupport(props) {

    const [complainList, setList] = useState({});
    const url = "https://group10projectbackend.herokuapp.com/support/getcomplaints";

    useEffect(() => {
        fetchComplains();
    }, []);

    async function fetchComplains() {
        const email = localStorage.getItem('email');
        if (email) {
            const data = new URLSearchParams();
            data.set('email', email);
            await axios.post(url, data).then((res) => {
                console.log(res.data.data);
                setList(res.data.data);
            });
        } else {
            alert("Something went wrong! Please login again.");
        }
    }

    async function fetchComplains() {
        const email = localStorage.getItem('email');
        if (email) {
            const data = new URLSearchParams();
            data.set('email', email);
            await axios.post(url, data).then((res) => {
                console.log(res.data.data);
                setList(res.data.data);
            });
        } else {
            alert("Something went wrong! Please login again.");
        }
    }

    return (
        <div style={{ 'height': '100%' }}>
            <UserHeader />
            <Body list={complainList} fetchComplains={fetchComplains} />
        </div>
    );

}

export default CustomerSupport;